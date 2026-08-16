import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { seed, DIMENSI } from './data/seed'
import { supabase } from './lib/supabase'
import { hydrateFromDb, pushKeys } from './db/sync'
import { useAuth } from './auth'

const KEY_BASE = 'rapor-ikm:v1'

// Keadaan kosong untuk "Mulai dari Nol" / sekolah baru:
// struktur utuh tanpa data. Dimensi Profil Lulusan dipertahankan
// karena merupakan acuan tetap regulasi.
export function emptyState(npsn = '') {
  return {
    sekolah: {
      npsn,
      nss: '',
      nama: '',
      alamat: '',
      desa: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      kodePos: '',
      telp: '',
      email: '',
      website: '',
      akreditasi: '',
      jenjang: 'SMP',
      kurikulum: 'Kurikulum Merdeka',
      tahunPelajaran: '',
      semester: 1,
      hariEfektif: 120,
      kepalaSekolah: '',
      nipKepsek: '',
      batasA: 90,
      batasB: 80,
      batasC: 70,
    },
    kelas: [],
    siswa: [],
    mapel: [],
    nilai: {},
    dimensi: DIMENSI,
    profilLulusan: {},
    kokurikuler: [],
    ekskul: [],
    kehadiran: {},
    catatanWali: {},
    deskripsi: {},
  }
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Multi-sekolah: cache lokal dipisah per NPSN agar data sekolah A
// tidak pernah bocor ke sekolah B. Tanpa NPSN (mode lokal) memakai
// kunci lama + seed contoh.
function loadLocal(npsn) {
  const key = npsn ? `${KEY_BASE}:${npsn}` : KEY_BASE
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.sekolah && Array.isArray(parsed.siswa)) return parsed
    }
  } catch {
    /* fallback */
  }
  return npsn ? emptyState(npsn) : deepClone(seed)
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
      // Multi-sekolah: reset = mulai kosong untuk sekolah ini;
      // mode lokal (tanpa NPSN) tetap mengembalikan data contoh.
      return state.sekolah?.npsn ? emptyState(state.sekolah.npsn) : deepClone(seed)
    case 'WIPE':
      return emptyState(state.sekolah?.npsn || '')
    case 'IMPORT':
      return action.value
    default:
      return state
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children, npsn }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadLocal(npsn))
  const [mode, setMode] = useState('checking') // 'checking' | 'online' | 'local'
  const lastPushed = useRef({})
  const { session } = useAuth()
  const sessionRef = useRef(session)
  sessionRef.current = session

  // Simpan lokal sebagai cadangan (per NPSN; tetap berfungsi offline)
  useEffect(() => {
    try {
      const key = npsn ? `${KEY_BASE}:${npsn}` : KEY_BASE
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* storage penuh — abaikan */
    }
  }, [state, npsn])

  // Hydrate dari database saat aplikasi dimuat (data sekolah ini saja)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!supabase) {
        setMode('local')
        return
      }
      if (!npsn) {
        // Belum ada NPSN (menunggu login) → tunggu remount store
        setMode('checking')
        return
      }
      try {
        const dbState = await hydrateFromDb(npsn)
        if (cancelled) return
        if (dbState) {
          dispatch({ type: 'HYDRATE', value: dbState })
          const snap = {}
          for (const k of Object.keys(dbState)) snap[k] = JSON.stringify(dbState[k])
          lastPushed.current = snap
          setMode('online')
        } else {
          // Sekolah ini belum punya data → pakai data lokal (kosong)
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
  }, [npsn])

  // Sinkronisasi write-through: push perubahan (debounce 800 ms) ke database.
  useEffect(() => {
    if (mode !== 'online' || !supabase || !session || !npsn) return
    const timer = setTimeout(async () => {
      try {
        const dirty = Object.keys(state).filter(
          (k) => lastPushed.current[k] === undefined || JSON.stringify(state[k]) !== lastPushed.current[k],
        )
        if (!dirty.length) return
        await pushKeys(state, dirty, npsn)
        const snap = {}
        for (const k of dirty) snap[k] = JSON.stringify(state[k])
        lastPushed.current = { ...lastPushed.current, ...snap }
      } catch (e) {
        console.warn('Gagal menyinkronkan perubahan ke database:', e.message)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [state, mode, session, npsn])

  const value = useMemo(() => ({ state, dispatch, mode }), [state, mode])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  return useContext(StoreCtx)
}
