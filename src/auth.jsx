import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [role, setRole] = useState(null) // 'admin' | 'guru' | null

  const refreshRole = useCallback(async (user) => {
    if (!supabase || !user) {
      setRole(null)
      return
    }
    try {
      const { data } = await supabase.from('users_meta').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        setRole(data.role)
      } else {
        // Bootstrap: pengguna pertama yang masuk otomatis menjadi admin
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
      }
    } catch (e) {
      console.warn('Gagal memuat hak akses:', e.message)
      setRole(null)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        if (data.session?.user) refreshRole(data.session.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) refreshRole(s.user)
      else setRole(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [refreshRole])

  return <AuthCtx.Provider value={{ session, loading, role, refreshRole }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
