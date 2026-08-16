import { useState } from 'react'
import { Save, X, Pencil, Trash2, Info } from 'lucide-react'
import { Card, Button, Input, Select, Field, PageHeader, Badge } from '../components/ui'
import { useStore } from '../store'

const DEFAULT_SEKOLAH = {
  npsn: '',
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
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-2">
      <span className="w-44 shrink-0 text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{value || <span className="text-slate-300">—</span>}</span>
    </div>
  )
}

export default function Sekolah() {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...state.sekolah })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mulaiEdit = () => {
    setForm({ ...state.sekolah })
    setEditing(true)
  }

  const save = () => {
    dispatch({ type: 'SET', key: 'sekolah', value: { ...state.sekolah, ...form } })
    setEditing(false)
  }

  const hapusData = () => {
    if (!window.confirm('Hapus SELURUH data profil sekolah? Semua field akan dikosongkan (isi ulang nanti).')) return
    dispatch({ type: 'SET', key: 'sekolah', value: { ...DEFAULT_SEKOLAH } })
    setForm({ ...DEFAULT_SEKOLAH })
    setEditing(false)
  }

  const s = state.sekolah
  const profilKosong = !(s.nama || s.npsn || s.alamat || s.kabupaten || s.kepalaSekolah)

  return (
    <div>
      <PageHeader
        title="Profil Sekolah"
        subtitle="Identitas satuan pendidikan yang tercetak pada kop rapor, serta pengaturan semester dan ambang predikat."
        actions={
          editing ? (
            <>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                <X size={15} /> Batal
              </Button>
              <Button onClick={save}>
                <Save size={15} /> Simpan Perubahan
              </Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={hapusData}>
                <Trash2 size={15} /> Hapus Data
              </Button>
              <Button onClick={mulaiEdit}>
                <Pencil size={15} /> {profilKosong ? 'Isi Data Profil' : 'Edit Data'}
              </Button>
            </>
          )
        }
      />

      {!editing ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-2 text-sm font-bold text-slate-900">Identitas Satuan Pendidikan</h2>
            <Row label="NPSN" value={s.npsn} />
            <Row label="NSS / NPS" value={s.nss} />
            <Row label="Nama Sekolah" value={s.nama} />
            <Row label="Alamat" value={s.alamat} />
            <Row label="Desa/Kelurahan" value={s.desa} />
            <Row label="Kecamatan" value={s.kecamatan} />
            <Row label="Kabupaten/Kota" value={s.kabupaten} />
            <Row label="Provinsi" value={s.provinsi} />
            <Row label="Kode Pos" value={s.kodePos} />
            <Row label="Telepon" value={s.telp} />
            <Row label="Email" value={s.email} />
            <Row label="Website" value={s.website} />
            <Row label="Akreditasi" value={s.akreditasi} />
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-bold text-slate-900">Kepala Sekolah</h2>
              <Row label="Nama" value={s.kepalaSekolah} />
              <Row label="NIP" value={s.nipKepsek} />
            </Card>

            <Card className="p-5">
              <h2 className="mb-2 text-sm font-bold text-slate-900">Tahun Ajaran & Penilaian</h2>
              <Row label="Tahun Pelajaran" value={s.tahunPelajaran} />
              <Row label="Semester" value={s.semester === 1 ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'} />
              <Row label="Jenjang" value={s.jenjang} />
              <Row label="Kurikulum" value={s.kurikulum} />
              <Row label="Hari Efektif" value={`${s.hariEfektif} hari`} />
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Info size={15} className="text-emerald-600" /> Ambang Predikat
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="emerald">A ≥ {s.batasA} — Sangat Baik</Badge>
                <Badge tone="sky">B ≥ {s.batasB} — Baik</Badge>
                <Badge tone="amber">C ≥ {s.batasC} — Cukup</Badge>
                <Badge tone="rose">D &lt; {s.batasC} — Perlu Bimbingan</Badge>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Identitas Satuan Pendidikan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NPSN">
                <Input value={form.npsn} onChange={(e) => set('npsn', e.target.value)} />
              </Field>
              <Field label="NSS / NPS">
                <Input value={form.nss} onChange={(e) => set('nss', e.target.value)} />
              </Field>
              <Field label="Nama Sekolah" className="sm:col-span-2">
                <Input value={form.nama} onChange={(e) => set('nama', e.target.value)} />
              </Field>
              <Field label="Alamat" className="sm:col-span-2">
                <Input value={form.alamat} onChange={(e) => set('alamat', e.target.value)} />
              </Field>
              <Field label="Desa/Kelurahan">
                <Input value={form.desa} onChange={(e) => set('desa', e.target.value)} />
              </Field>
              <Field label="Kecamatan">
                <Input value={form.kecamatan} onChange={(e) => set('kecamatan', e.target.value)} />
              </Field>
              <Field label="Kabupaten/Kota">
                <Input value={form.kabupaten} onChange={(e) => set('kabupaten', e.target.value)} />
              </Field>
              <Field label="Provinsi">
                <Input value={form.provinsi} onChange={(e) => set('provinsi', e.target.value)} />
              </Field>
              <Field label="Kode Pos">
                <Input value={form.kodePos} onChange={(e) => set('kodePos', e.target.value)} />
              </Field>
              <Field label="Telepon">
                <Input value={form.telp} onChange={(e) => set('telp', e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Website">
                <Input value={form.website} onChange={(e) => set('website', e.target.value)} />
              </Field>
              <Field label="Akreditasi">
                <Input value={form.akreditasi} onChange={(e) => set('akreditasi', e.target.value)} />
              </Field>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-900">Kepala Sekolah</h2>
              <div className="space-y-4">
                <Field label="Nama Kepala Sekolah">
                  <Input value={form.kepalaSekolah} onChange={(e) => set('kepalaSekolah', e.target.value)} />
                </Field>
                <Field label="NIP">
                  <Input value={form.nipKepsek} onChange={(e) => set('nipKepsek', e.target.value)} />
                </Field>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-900">Tahun Ajaran & Penilaian</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tahun Pelajaran">
                    <Input value={form.tahunPelajaran} onChange={(e) => set('tahunPelajaran', e.target.value)} />
                  </Field>
                  <Field label="Semester">
                    <Select value={String(form.semester)} onChange={(e) => set('semester', Number(e.target.value))}>
                      <option value="1">Semester 1 (Ganjil)</option>
                      <option value="2">Semester 2 (Genap)</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Jenjang">
                  <Select value={form.jenjang} onChange={(e) => set('jenjang', e.target.value)}>
                    {['SD', 'SMP', 'SMA', 'SMK'].map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kurikulum">
                  <Select value={form.kurikulum} onChange={(e) => set('kurikulum', e.target.value)}>
                    <option>Kurikulum Merdeka</option>
                    <option>Kurikulum 2013</option>
                    <option>Kurikulum Merdeka + K13</option>
                  </Select>
                </Field>
                <Field label="Hari Efektif (dasar % kehadiran)">
                  <Input type="number" value={form.hariEfektif} onChange={(e) => set('hariEfektif', Number(e.target.value))} />
                </Field>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Info size={15} className="text-emerald-600" /> Ambang Predikat
              </h2>
              <p className="mb-3 text-xs text-slate-500">Interval nilai untuk predikat pada rapor (dapat disesuaikan kebijakan sekolah).</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="A ≥">
                  <Input type="number" value={form.batasA} onChange={(e) => set('batasA', Number(e.target.value))} />
                </Field>
                <Field label="B ≥">
                  <Input type="number" value={form.batasB} onChange={(e) => set('batasB', Number(e.target.value))} />
                </Field>
                <Field label="C ≥">
                  <Input type="number" value={form.batasC} onChange={(e) => set('batasC', Number(e.target.value))} />
                </Field>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
