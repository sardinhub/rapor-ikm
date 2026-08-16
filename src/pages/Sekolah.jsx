import { useState } from 'react'
import { Save, Info } from 'lucide-react'
import { Card, Button, Input, Select, Field, PageHeader, Badge } from '../components/ui'
import { useStore } from '../store'

export default function Sekolah() {
  const { state, dispatch } = useStore()
  const [form, setForm] = useState({ ...state.sekolah })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    dispatch({ type: 'SET', key: 'sekolah', value: { ...state.sekolah, ...form } })
    alert('Profil sekolah berhasil disimpan.')
  }

  return (
    <div>
      <PageHeader
        title="Profil Sekolah"
        subtitle="Identitas satuan pendidikan yang tercetak pada kop rapor, serta pengaturan semester dan ambang predikat."
        actions={
          <Button onClick={save}>
            <Save size={15} /> Simpan Profil
          </Button>
        }
      />

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
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="emerald">A = Sangat Baik</Badge>
              <Badge tone="sky">B = Baik</Badge>
              <Badge tone="amber">C = Cukup</Badge>
              <Badge tone="rose">D = Perlu Bimbingan</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
