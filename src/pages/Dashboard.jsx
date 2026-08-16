import { useRef } from 'react'
import {
  Users,
  School,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react'
import { Card, Button, StatCard, Badge, PageHeader } from '../components/ui'
import { useStore } from '../store'
import { rataRataNilai, predikat } from '../lib/utils'
import { REGULASI } from '../data/regulasi'

export default function Dashboard({ go }) {
  const { state, dispatch } = useStore()
  const fileRef = useRef(null)

  const totalSiswa = state.siswa.length
  const totalKelas = state.kelas.length
  const totalMapel = state.mapel.length

  // Status pengisian nilai: sel nilai yang terisi / total sel
  let terisi = 0
  let total = 0
  for (const mp of state.mapel) {
    const mNilai = state.nilai[mp.id] || {}
    for (const s of state.siswa.filter((x) => x.kelasId === mp.kelasId)) {
      for (const tp of mp.tp) {
        total++
        if (mNilai[s.id]?.[tp.id] != null && mNilai[s.id][tp.id] !== '') terisi++
      }
    }
  }
  const persen = total ? Math.round((terisi / total) * 100) : 0

  // Ringkasan nilai rata-rata per kelas
  const ringkasanKelas = state.kelas.map((k) => {
    const siswaK = state.siswa.filter((s) => s.kelasId === k.id)
    const mapelK = state.mapel.filter((m) => m.kelasId === k.id)
    let totalR = 0
    let n = 0
    for (const s of siswaK) {
      for (const mp of mapelK) {
        const r = rataRataNilai(state.nilai[mp.id]?.[s.id])
        if (r != null) {
          totalR += r
          n++
        }
      }
    }
    return { kelas: k, jumlahSiswa: siswaK.length, jumlahMapel: mapelK.length, rataRata: n ? totalR / n : null }
  })

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapor-ikm-${state.sekolah.tahunPelajaran}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data?.sekolah && Array.isArray(data?.siswa)) {
          dispatch({ type: 'IMPORT', value: data })
          alert('Data berhasil diimpor.')
        } else {
          alert('File tidak dikenali sebagai data Rapor IKM.')
        }
      } catch {
        alert('Gagal membaca file JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetData = () => {
    if (window.confirm('Reset seluruh data ke contoh awal? Seluruh perubahan akan hilang.')) {
      dispatch({ type: 'RESET' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Ringkasan rapor ${state.sekolah.kurikulum} — Tahun Pelajaran ${state.sekolah.tahunPelajaran}, Semester ${state.sekolah.semester}`}
        actions={
          <>
            <Button variant="secondary" onClick={exportData}>
              <Download size={15} /> Ekspor Data
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Impor Data
            </Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
            <Button variant="secondary" onClick={resetData}>
              <RotateCcw size={15} /> Reset Contoh
            </Button>
            <Button onClick={() => go('rapor')}>
              <FileText size={15} /> Buka Rapor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<School size={20} />} label="Kelas / Rombel" value={totalKelas} tone="sky" />
        <StatCard icon={<Users size={20} />} label="Peserta Didik" value={totalSiswa} tone="emerald" />
        <StatCard icon={<BookOpen size={20} />} label="Mata Pelajaran" value={totalMapel} tone="violet" />
        <StatCard
          icon={persen === 100 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          label="Pengisian Nilai"
          value={`${persen}%`}
          tone={persen === 100 ? 'emerald' : 'amber'}
          sub={persen === 100 ? 'Lengkap — siap cetak rapor' : 'Masih ada yang perlu diisi'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Ringkasan per Kelas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Kelas</th>
                  <th className="py-2 pr-3 font-semibold">Fase</th>
                  <th className="py-2 pr-3 font-semibold">Peserta Didik</th>
                  <th className="py-2 pr-3 font-semibold">Mata Pelajaran</th>
                  <th className="py-2 pr-3 font-semibold">Rata-rata Nilai</th>
                  <th className="py-2 font-semibold">Wali Kelas</th>
                </tr>
              </thead>
              <tbody>
                {ringkasanKelas.map(({ kelas, jumlahSiswa, jumlahMapel, rataRata }) => (
                  <tr key={kelas.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{kelas.nama}</td>
                    <td className="py-2 pr-3 text-slate-600">{kelas.fase}</td>
                    <td className="py-2 pr-3 text-slate-600">{jumlahSiswa}</td>
                    <td className="py-2 pr-3 text-slate-600">{jumlahMapel}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {rataRata != null ? (
                        <>
                          <span className="font-semibold">{rataRata.toFixed(1)}</span>{' '}
                          <Badge tone={rataRata >= 80 ? 'emerald' : rataRata >= 70 ? 'amber' : 'rose'}>
                            {predikat(rataRata, state.sekolah)}
                          </Badge>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 text-slate-600">{kelas.waliKelas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Acuan Regulasi</h2>
          <p className="mb-3 text-xs text-slate-500">Aplikasi disusun mengikuti regulasi Kemendikdasmen terbaru:</p>
          <ul className="space-y-2 text-xs text-slate-600">
            {REGULASI.slice(0, 5).map((r) => (
              <li key={r.nomor} className="flex gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>
                  <strong>{r.nomor}</strong> — {r.judul}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-4 w-full" onClick={() => go('hukum')}>
            Lihat Dasar Hukum Lengkap
          </Button>
        </Card>
      </div>
    </div>
  )
}
