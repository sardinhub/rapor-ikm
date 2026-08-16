import { useState } from 'react'
import { CalendarCheck, Info, Eraser } from 'lucide-react'
import { Card, Button, Select, Field, PageHeader, Badge } from '../components/ui'
import { useStore, deepClone } from '../store'
import { persenKehadiran } from '../lib/utils'

export default function Kehadiran() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')

  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelasId)
  const hariEfektif = state.sekolah.hariEfektif || 120

  const bersihkan = () => {
    if (!window.confirm('Kosongkan SEMUA data kehadiran (sakit/izin/alpha direset ke 0 untuk seluruh peserta didik)?')) return
    dispatch({ type: 'SET', key: 'kehadiran', value: {} })
  }

  const update = (siswaId, field, val) => {
    const kehadiran = deepClone(state.kehadiran || {})
    kehadiran[siswaId] = kehadiran[siswaId] || { sakit: 0, izin: 0, alpha: 0 }
    kehadiran[siswaId][field] = Math.max(0, Number(val) || 0)
    dispatch({ type: 'SET', key: 'kehadiran', value: kehadiran })
  }

  return (
    <div>
      <PageHeader
        title="Kehadiran"
        subtitle={`Rekapitulasi ketidakhadiran peserta didik dalam hari (Sakit, Izin, Tanpa Keterangan). Persentase kehadiran dihitung dari ${hariEfektif} hari efektif.`}
        actions={
          <Button variant="danger" onClick={bersihkan} disabled={state.siswa.length === 0}>
            <Eraser size={15} /> Bersihkan Semua Kehadiran
          </Button>
        }
      />

      <div className="no-print mb-6 flex flex-wrap items-end gap-4">
        <Field label="Pilih Kelas" className="w-52">
          <Select value={kelasId} onChange={(e) => setKelasId(e.target.value)}>
            {state.kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Badge tone="sky">Hari efektif semester: {hariEfektif} hari</Badge>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-semibold">No</th>
                <th className="px-3 py-2.5 font-semibold">Peserta Didik</th>
                <th className="px-3 py-2.5 text-center font-semibold">Sakit</th>
                <th className="px-3 py-2.5 text-center font-semibold">Izin</th>
                <th className="px-3 py-2.5 text-center font-semibold">Alpha</th>
                <th className="px-3 py-2.5 text-center font-semibold">Total</th>
                <th className="px-5 py-2.5 text-center font-semibold">% Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {siswaKelas.map((s, i) => {
                const k = state.kehadiran?.[s.id] || { sakit: 0, izin: 0, alpha: 0 }
                const pct = persenKehadiran(k, hariEfektif)
                return (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="px-5 py-2 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{s.nama}</td>
                    {(['sakit', 'izin', 'alpha']).map((f) => (
                      <td key={f} className="px-3 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={k[f] ?? 0}
                          onChange={(e) => update(s.id, f, e.target.value)}
                          className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-center text-sm outline-none focus:border-emerald-500"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center text-slate-600">{(k.sakit || 0) + (k.izin || 0) + (k.alpha || 0)}</td>
                    <td className="px-5 py-2 text-center">
                      <Badge tone={pct >= 95 ? 'emerald' : pct >= 90 ? 'amber' : 'rose'}>{pct}%</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 flex items-start gap-3 border-l-4 border-l-sky-500 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
        <p className="text-xs leading-relaxed text-slate-600">
          Data kehadiran mengacu pada rekapitulasi kehadiran harian kelas dan tercantum pada rapor sebagai bagian dari laporan hasil belajar peserta didik.
        </p>
      </Card>
    </div>
  )
}
