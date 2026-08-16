import { useState } from 'react'
import { Award, Info, RotateCcw } from 'lucide-react'
import { Card, Button, Select, Field, PageHeader, Badge, EmptyState } from '../components/ui'
import { useStore, deepClone } from '../store'
import { formatTgl } from '../lib/utils'

export default function ProfilLulusan() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [siswaId, setSiswaId] = useState(state.siswa[0]?.id || '')

  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelasId)
  const siswa = siswaKelas.find((s) => s.id === siswaId) || siswaKelas[0]

  const updateDimensi = (dimensiId, text) => {
    const profil = deepClone(state.profilLulusan || {})
    profil[siswa.id] = profil[siswa.id] || {}
    profil[siswa.id][dimensiId] = text
    dispatch({ type: 'SET', key: 'profilLulusan', value: profil })
  }

  const resetDimensi = (dimensiId) => {
    const d = state.dimensi.find((x) => x.id === dimensiId)
    if (!d) return
    updateDimensi(dimensiId, d.default)
  }

  const resetSemua = () => {
    if (state.siswa.length === 0) return
    if (!window.confirm('Kembalikan SEMUA deskripsi Profil Lulusan ke deskripsi awal (standar)? Deskripsi yang sudah diedit akan diganti.')) return
    const profil = {}
    for (const s of state.siswa) {
      profil[s.id] = {}
      for (const d of state.dimensi) profil[s.id][d.id] = d.default
    }
    dispatch({ type: 'SET', key: 'profilLulusan', value: profil })
  }

  return (
    <div>
      <PageHeader
        title="Profil Lulusan (8 Dimensi)"
        subtitle="Penguatan karakter dan kompetensi sesuai Standar Kompetensi Lulusan — Permendikdasmen No. 10 Tahun 2025. Deskripsi ini tercetak pada rapor."
        actions={
          <Button variant="secondary" onClick={resetSemua} disabled={state.siswa.length === 0}>
            <RotateCcw size={15} /> Reset Semua Deskripsi
          </Button>
        }
      />

      <div className="no-print mb-6 flex flex-wrap items-end gap-4">
        <Field label="Pilih Kelas" className="w-52">
          <Select value={kelasId} onChange={(e) => { setKelasId(e.target.value); setSiswaId('') }}>
            {state.kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pilih Peserta Didik" className="w-72">
          <Select value={siswa?.id || ''} onChange={(e) => setSiswaId(e.target.value)}>
            {siswaKelas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {!siswa ? (
        <EmptyState icon={<Award size={36} />} title="Belum ada peserta didik" />
      ) : (
        <>
          <Card className="mb-6 p-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
              <p>
                <strong className="text-slate-900">{siswa.nama}</strong>
              </p>
              <p className="text-slate-500">
                NISN {siswa.nisn} · Kelas {siswaKelas[0] ? state.kelas.find((k) => k.id === kelasId)?.nama : '-'} · Lahir {siswa.tempatLahir},{' '}
                {formatTgl(siswa.tglLahir)}
              </p>
              <Badge tone="emerald">8 Dimensi Profil Lulusan</Badge>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {state.dimensi.map((d, i) => (
              <Card key={d.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </div>
                    <h3 className="pt-0.5 text-sm font-bold leading-snug text-slate-900">{d.nama}</h3>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={state.profilLulusan?.[siswa.id]?.[d.id] ?? ''}
                  onChange={(e) => updateDimensi(d.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <div className="mt-1 flex justify-end">
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => resetDimensi(d.id)}>
                    Kembalikan ke Deskripsi Awal
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 flex items-start gap-3 border-l-4 border-l-sky-500 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
            <p className="text-xs leading-relaxed text-slate-600">
              <strong>Catatan regulasi:</strong> Permendikdasmen No. 10 Tahun 2025 menetapkan 8 dimensi Profil Lulusan sebagai penyempurnaan dimensi Profil Pelajar
              Pancasila: Keimanan dan Ketakwaan kepada Tuhan YME, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, dan Komunikasi.
              Deskripsi dapat disesuaikan dengan kondisi aktual peserta didik oleh wali kelas/guru.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
