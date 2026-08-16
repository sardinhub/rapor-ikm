import { useState } from 'react'
import { GraduationCap, LogIn, UserPlus, AlertCircle, Loader2, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input, Field, Button, Card } from '../components/ui'
import { useAuth } from '../auth'

const NPSN_HINT = 'NPSN (8 digit angka, contoh: 20328901)'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [npsn, setNpsn] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const { linkNpsn } = useAuth()

  const validNpsn = /^\d{8}$/.test(npsn.trim())

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!email.trim() || password.length < 6) {
      setError('Isi email dan password (minimal 6 karakter).')
      return
    }
    if (!validNpsn) {
      setError('NPSN wajib diisi dan terdiri dari 8 digit angka.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (signErr) {
          setError(signErr.message)
          return
        }
        // Ikat NPSN ke akun (ditolak bila NPSN berbeda dari sekolah akun)
        try {
          await linkNpsn(npsn.trim())
        } catch (linkErr) {
          await supabase.auth.signOut().catch(() => {})
          setError(linkErr.message)
        }
      } else {
        const { data, error: signErr } = await supabase.auth.signUp({ email: email.trim(), password })
        if (signErr) {
          setError(signErr.message)
        } else if (data?.session) {
          try {
            await linkNpsn(npsn.trim())
          } catch (linkErr) {
            await supabase.auth.signOut().catch(() => {})
            setError(linkErr.message)
          }
        } else {
          setInfo('Akun berhasil dibuat. Silakan cek email Anda untuk konfirmasi, lalu masuk dengan NPSN sekolah.')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Rapor IKM</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk dengan NPSN sekolah untuk mengelola rapor Kurikulum Merdeka</p>
        </div>

        <Card className="p-6">
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfo('') }}
              className={`rounded-md py-2 transition-colors ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setInfo('') }}
              className={`rounded-md py-2 transition-colors ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="NPSN Sekolah">
              <Input
                value={npsn}
                onChange={(e) => setNpsn(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder={NPSN_HINT}
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" autoComplete="email" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {info && <div className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">{info}</div>}

            <Button type="submit" className="w-full justify-center py-2.5" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {mode === 'login' ? 'Masuk' : 'Buat Akun'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
          Setiap sekolah memiliki NPSN sendiri dan harus didaftarkan terlebih dahulu oleh super admin. Setelah login, Anda hanya melihat data rapor sekolah dengan NPSN tersebut.
        </p>
      </div>
    </div>
  )
}

// Ditampilkan bila sesi sudah ada tetapi akun belum terhubung ke NPSN
// (mis. akun lama atau akun yang dibuat admin sebelum fitur ini).
export function NpsnGate() {
  const [npsn, setNpsn] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { linkNpsn } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!/^\d{8}$/.test(npsn.trim())) {
      setError('NPSN wajib diisi dan terdiri dari 8 digit angka.')
      return
    }
    setBusy(true)
    try {
      await linkNpsn(npsn.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Building2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Hubungkan NPSN Sekolah</h1>
          <p className="mt-1 text-sm text-slate-500">
            Akun Anda belum terhubung ke sekolah. Masukkan NPSN agar data rapor sekolah Anda dapat dimuat.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="NPSN Sekolah">
              <Input
                value={npsn}
                onChange={(e) => setNpsn(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="8 digit angka, contoh: 20328901"
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </Field>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full justify-center py-2.5" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null} Hubungkan
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
