import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, UserPlus, Trash2, Loader2, AlertCircle, Info } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState } from '../components/ui'
import { useAuth } from '../auth'
import { formatTgl } from '../lib/utils'

async function api(path, method, body) {
  const { supabase } = await import('../lib/supabase')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `Gagal (${res.status})`)
  return json
}

const KOSONG = { email: '', nama: '', password: '', role: 'guru', npsn: '' }

export default function Admin() {
  const { session } = useAuth()
  const [users, setUsers] = useState(null) // null = loading
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(KOSONG)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      setUsers(await api('/api/users', 'GET'))
    } catch (e) {
      setError(e.message)
      setUsers([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const tambah = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return setError('Email dan password wajib diisi.')
    setBusy(true)
    setError('')
    setInfo('')
    try {
      await api('/api/users', 'POST', { ...form, email: form.email.trim() })
      setInfo(`Akun ${form.email} berhasil dibuat.`)
      setModal(false)
      setForm(KOSONG)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const ubahRole = async (u, role) => {
    try {
      await api('/api/users', 'PATCH', { id: u.id, role })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const ubahNpsn = async (u, npsn) => {
    try {
      await api('/api/users', 'PATCH', { id: u.id, npsn: npsn.trim() })
      load()
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  const hapus = async (u) => {
    if (!window.confirm(`Hapus pengguna ${u.email}? Seluruh akses akun ini akan dicabut.`)) return
    try {
      await api('/api/users', 'DELETE', { id: u.id })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const selfId = session?.user?.id

  return (
    <div>
      <PageHeader
        title="Admin — Pengguna & Hak Akses"
        subtitle="Kelola akun pengguna aplikasi: tambah guru/admin, ubah peran (hak akses), dan hapus akun. Peran admin dapat melihat & mengelola seluruh data; peran guru untuk pengelola rapor."
        actions={
          <Button onClick={() => { setForm(KOSONG); setModal(true); setError('') }}>
            <UserPlus size={15} /> Tambah Pengguna
          </Button>
        }
      />

      {error && (
        <Card className="mb-4 flex items-start gap-2 border-l-4 border-l-rose-500 p-4">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-sm text-rose-700">{error}</p>
        </Card>
      )}
      {info && (
        <Card className="mb-4 flex items-start gap-2 border-l-4 border-l-emerald-500 p-4">
          <Info size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700">{info}</p>
        </Card>
      )}

      {users === null ? (
        <Card className="flex items-center justify-center gap-2 p-10 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Memuat daftar pengguna...
        </Card>
      ) : users.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={36} />} title="Belum ada pengguna terdaftar" desc="Tambahkan pengguna pertama melalui tombol Tambah Pengguna." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Nama</th>
                  <th className="px-3 py-2.5 font-semibold">Email</th>
                  <th className="px-3 py-2.5 font-semibold">NPSN Sekolah</th>
                  <th className="px-3 py-2.5 font-semibold">Hak Akses</th>
                  <th className="px-3 py-2.5 font-semibold">Terdaftar</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="px-5 py-2.5 font-semibold text-slate-800">
                      {u.nama}
                      {u.id === selfId && <Badge tone="emerald" >Anda</Badge>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{u.email}</td>
                    <td className="px-3 py-2.5">
                      <Input
                        value={u.npsn || ''}
                        onChange={(e) => ubahNpsn(u, e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="NPSN"
                        className="w-28 px-2 py-1 text-xs"
                        title="NPSN sekolah pengguna (8 digit)"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Select value={u.role} onChange={(e) => ubahRole(u, e.target.value)} className="w-32">
                          <option value="admin">Admin</option>
                          <option value="guru">Guru</option>
                        </Select>
                        <Badge tone={u.role === 'admin' ? 'violet' : 'sky'}>{u.role === 'admin' ? 'Admin' : 'Guru'}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{u.createdAt ? formatTgl(u.createdAt.slice(0, 10)) : '-'}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end">
                        <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600 disabled:opacity-40" disabled={u.id === selfId} title={u.id === selfId ? 'Tidak dapat menghapus akun sendiri' : 'Hapus pengguna'} onClick={() => hapus(u)}>
                          <Trash2 size={13} /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="mt-6 flex items-start gap-3 border-l-4 border-l-sky-500 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
        <div className="text-xs leading-relaxed text-slate-600">
          <strong>Catatan:</strong> Pengguna pertama yang masuk ke aplikasi otomatis menjadi <strong>admin</strong>. Akun baru yang dibuat di sini langsung dapat masuk
          (tanpa konfirmasi email). Untuk keamanan lebih, nonaktifkan pendaftaran publik di Supabase → Authentication → Sign In / Up → <em>Allow new users to sign up</em>.
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Pengguna">
        <form onSubmit={tambah} className="space-y-4">
          <Field label="Nama Lengkap">
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth: Budi Santoso, S.Pd." />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nama@sekolah.sch.id" required />
          </Field>
          <Field label="Password (min. 6 karakter)">
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </Field>
          <Field label="NPSN Sekolah (8 digit)">
            <Input
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              placeholder="cth: 20328901"
              inputMode="numeric"
            />
          </Field>
          <Field label="Hak Akses">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="guru">Guru — kelola rapor (data sekolah)</option>
              <option value="admin">Admin — kelola pengguna &amp; semua data</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 size={15} className="animate-spin" />} Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
