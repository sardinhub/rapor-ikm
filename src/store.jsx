import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { seed } from './data/seed'
import { supabase } from './lib/supabase'
import { hydrateFromDb, pushKeys } from './db/sync'
import { useAuth } from './auth'

const KEY = 'rapor-ikm:v1'

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.sekolah && Array.isArray(parsed.siswa)) return parsed
    }
  } catch {
    /* fallback ke seed */
  }
  return deepClone(seed)
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.value
    case 'SET':
      return { ...state, [action.key]: action.value }
    case 'PATCH':
      return { ...state, [action.key]: { ...(state[action.key] || {}), ...action.value } }
    case 'RESET':
      return deepClone(seed)
    case 'IMPORT':
      return action.value
    default:
      return state
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadLocal)
  const [mode, setMode] = useState('checking') // 'checking' | 'online' | 'local'
  const lastPushed = useRef({})
  const { session } = useAuth()
  const sessionRef = useRef(session)
  sessionRef.current = session

  // Simpan lokal sebagai cadangan (tetap berfungsi offline)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage penuh — abaikan */
    }
  }, [state])

  // Hydrate dari database saat aplikasi dimuat
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!supabase) {
        setMode('local')
        return
      }
      try {
        const dbState = await hydrateFromDb()
        if (cancelled) return
        if (dbState) {
          dispatch({ type: 'HYDRATE', value: dbState })
          const snap = {}
          for (const k of Object.keys(dbState)) snap[k] = JSON.stringify(dbState[k])
          lastPushed.current = snap
          setMode('online')
        } else {
          // Database kosong → isi dengan data lokal (seed/contoh)
          lastPushed.current = {}
          setMode('online')
        }
      } catch (e) {
        console.warn('Tidak dapat terhubung ke database, menggunakan mode lokal:', e.message)
        if (!cancelled) setMode('local')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Sinkronisasi write-through: push perubahan (debounce 800 ms) ke database
  useEffect(() => {
    if (mode !== 'online' || !supabase || !sessionRef.current) return
    const timer = setTimeout(async () => {
      try {
        const dirty = Object.keys(state).filter(
          (k) => lastPushed.current[k] === undefined || JSON.stringify(state[k]) !== lastPushed.current[k],
        )
        if (!dirty.length) return
        await pushKeys(state, dirty)
        const snap = {}
        for (const k of dirty) snap[k] = JSON.stringify(state[k])
        lastPushed.current = { ...lastPushed.current, ...snap }
      } catch (e) {
        console.warn('Gagal menyinkronkan perubahan ke database:', e.message)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [state, mode])

  const value = useMemo(() => ({ state, dispatch, mode }), [state, mode])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  return useContext(StoreCtx)
}
