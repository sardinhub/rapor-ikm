import { useCallback, useEffect, useState } from 'react'
import { Building2, School, Pencil, Trash2, Loader2, AlertCircle, Info, Power } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState } from '../components/ui'
import { api } from '../lib/api'
import { formatTgl } from '../lib/utils'

const KOSONG = { npsn: '', nama: '', jenjang: 'SD', alamat: '', kabupaten: '', provinsi: '', keterangan: '' }

export default function RegistrasiSekolah() {
  const [list, setList] = useState(null) // null = loading
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null) // null = tambah baru
  const [form, setForm] = useState(KOSONG)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      setList(await api('/api/sekolah', 'GET'))
    } catch (e) {
      setError(e.message)
      setList([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const bukaTambah = () => {
    setForm(KOSONG)
    setEditing(null)
    setError('')
    setModal(true)
  }

  const bukaEdit = (s) => {
    setForm({
      npsn: s.npsn,
      nama: s.nama || '',
      jenjang: s.jenjang || 'SMP',
      alamat: s.alamat || '',
      kabupaten: s.kabupaten || '',
      provinsi: s.provinsi || '',
      keterangan: s.keterangan || '',
    })
    setEditing(s)
    setError('')
    setModal(true)
  }

  const simpan = async (e) => {
    e.preventDefault()
    if (!/^\d{8}$/.test(form.npsn)) return setError('NPSN wajib 8 digit angka.')
    if (!form.nama.trim()) return setError('Nama sekolah wajib diisi.')
    setBusy(true)
    setError('')
    setInfo('')
    try {
      if (editing) {
        await api('/api/sekolah', 'PATCH', {
          npsn: editing.npsn,
          nama: form.nama.trim(),
          jenjang: form.jenjang,
          alamat: form.alamat,
          kabupaten: form.kabupaten,
          provinsi: form.provinsi,
          keterangan: form.keterangan,
        })
        setInfo(`Data ${form.nama.trim()} diperbarui.`)
      } else {
        await api('/api/sekolah', 'POST', {
          ...form,
          nama: form.nama.trim(),
          status: 'aktif',
        })
        setInfo(`Sekolah ${form.nama.trim()} (NPSN ${form.npsn}) berhasil didaftarkan.`)
      }
      setModal(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async (s) => {
    const baru = s.status === 'aktif' ? 'nonaktif' : 'aktif'
    if (!window.confirm(`${baru === 'aktif' ? 'Aktifkan' : 'Nonaktifkan'} sekolah ${s.nama || s.npsn}?`)) return
    try {
      await api('/api/sekolah', 'PATCH', { npsn: s.npsn, status: baru })
      setInfo(`Status ${s.nama || s.npsn} → ${baru === 'aktif' ? 'Aktif' : 'Nonaktif'}.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const hapus = async (s) => {
    if (!window.confirm(`Hapus pendaftaran sekolah ${s.nama || s.npsn}? Sekolah ini tidak akan bisa login lagi.`)) return
    try {
      await api('/api/sekolah', 'DELETE', { npsn: s.npsn })
      setInfo(`Pendaftaran ${s.nama || s.npsn} dihapus.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Registrasi Sekolah"
        subtitle="Daftarkan sekolah yang boleh menggunakan aplikasi Rapor IKM. Sekolah wajib terdaftar dan berstatus Aktif sebelum penggunanya dapat login."
        actions={
          <Button onClick={bukaTambah}>
            <School size={15} /> Daftarkan Sekolah
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

      {list === null ? (
        <Card className="flex items-center justify-center gap-2 p-10 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Memuat daftar sekolah...
        </Card>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Building2 size={36} />}
          title="Belum ada sekolah terdaftar"
          desc="Daftarkan sekolah pertama melalui tombol Daftarkan Sekolah."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">NPSN</th>
                  <th className="px-3 py-2.5 font-semibold">Nama Sekolah</th>
                  <th className="px-3 py-2.5 font-semibold">Jenjang</th>
                  <th className="px-3 py-2.5 font-semibold">Kabupaten/Kota</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Terdaftar</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.npsn} className="border-b border-slate-100">
                    <td className="px-5 py-2.5 font-mono text-xs font-semibold text-slate-800">{s.npsn}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{s.nama || <span className="text-slate-400">—</span>}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.jenjang || '-'}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.kabupaten || '-'}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleStatus(s)} title="Ubah status" className="inline-flex items-center gap-1.5">
                        <Badge tone={s.status === 'aktif' ? 'emerald' : 'rose'}>{s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</Badge>
                        <Power size={13} className="text-slate-400 hover:text-slate-700" />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{s.created_at ? formatTgl(s.created_at.slice(0, 10)) : '-'}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => bukaEdit(s)}>
                          <Pencil size={13} /> Edit
                        </Button>
                        <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600" onClick={() => hapus(s)}>
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
          <strong>Alur penggunaan:</strong> Super admin mendaftarkan sekolah (NPSN + nama) → sekolah berstatus <strong>Aktif</strong> →
          guru/admin sekolah tersebut dapat login dengan NPSN-nya dan langsung mengelola data rapor sekolahnya sendiri.
          Sekolah dengan status <strong>Nonaktif</strong> atau belum terdaftar tidak dapat login.
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Ubah Data Sekolah' : 'Daftarkan Sekolah'}>
        <form onSubmit={simpan} className="space-y-4">
          <Field label="NPSN (8 digit)">
            <Input
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              placeholder="cth: 20328901"
              inputMode="numeric"
              required
              disabled={!!editing}
              className={editing ? 'bg-slate-100 text-slate-500' : ''}
            />
            {editing && <p className="mt-1 text-[11px] text-slate-400">NPSN tidak dapat diubah setelah didaftarkan.</p>}
          </Field>
          <Field label="Nama Sekolah">
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="cth: SMP Negeri 2 Nusantara" required />
          </Field>
          <Field label="Jenjang">
            <Select value={form.jenjang} onChange={(e) => setForm({ ...form, jenjang: e.target.value })}>
              {['SD', 'SMP', 'SMA', 'SMK'].map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kabupaten/Kota">
              <Input value={form.kabupaten} onChange={(e) => setForm({ ...form, kabupaten: e.target.value })} />
            </Field>
            <Field label="Provinsi">
              <Input value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} />
            </Field>
          </div>
          <Field label="Alamat">
            <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          </Field>
          <Field label="Keterangan (opsional)">
            <Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="cth: Kontrak tahun 2026" />
          </Field>
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 size={15} className="animate-spin" />} {editing ? 'Simpan Perubahan' : 'Daftarkan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
