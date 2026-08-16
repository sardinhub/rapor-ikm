import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [role, setRole] = useState(null) // 'admin' | 'guru' | null
  const [npsn, setNpsn] = useState(null) // NPSN sekolah aktif (tenant)

  const applyMe = useCallback((me) => {
    setRole(me.role || null)
    setNpsn(me.npsn || null)
  }, [])

  // Muat role + NPSN lewat API serverless (service role, bebas RLS).
  const refreshMe = useCallback(async (user) => {
    if (!supabase || !user) {
      setRole(null)
      setNpsn(null)
      return
    }
    try {
      const { data: sesi } = await supabase.auth.getSession()
      const token = sesi.session?.access_token
      if (token) {
        const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          applyMe(await res.json())
          return
        }
      }
    } catch {
      /* lanjut ke jalur cadangan */
    }
    // Jalur cadangan: query langsung (berfungsi bila migrasi RLS
    // 0003 sudah diterapkan di database).
    try {
      const { data } = await supabase.from('users_meta').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        setRole(data.role)
        setNpsn(data.npsn || null)
      } else {
        let newRole = 'guru'
        try {
          const { data: jumlah } = await supabase.rpc('users_meta_count')
          newRole = Number(jumlah) === 0 ? 'admin' : 'guru'
        } catch {
          newRole = 'guru'
        }
        await supabase.from('users_meta').upsert({
          id: user.id,
          email: user.email || '',
          nama: user.user_metadata?.nama || user.email || '',
          role: newRole,
        })
        setRole(newRole)
        setNpsn(null)
      }
    } catch (e) {
      console.warn('Gagal memuat hak akses:', e.message)
      setRole(null)
      setNpsn(null)
    }
  }, [applyMe])

  // Ikat NPSN sekolah ke akun saat login (dipanggil dari halaman login).
  // Menolak bila akun sudah terhubung ke NPSN lain (409 dari server).
  const linkNpsn = useCallback(
    async (npsnValue) => {
      if (!supabase) return
      const { data: sesi } = await supabase.auth.getSession()
      const token = sesi.session?.access_token
      if (!token) throw new Error('Sesi tidak ditemukan.')
      const res = await fetch('/api/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ npsn: npsnValue }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Gagal menghubungkan NPSN.')
      applyMe(json)
    },
    [applyMe],
  )

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        if (data.session?.user) refreshMe(data.session.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) refreshMe(s.user)
      else {
        setRole(null)
        setNpsn(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [refreshMe])

  return <AuthCtx.Provider value={{ session, loading, role, npsn, refreshMe, linkNpsn }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
