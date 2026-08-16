import { useState } from 'react'
import { Plus, Pencil, Trash2, Trophy, ShieldCheck } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState, cx } from '../components/ui'
import { useStore, deepClone } from '../store'
import { uid } from '../lib/utils'

const KOSONG = { nama: '', pembina: '', keterangan: '' }

export default function Ekskul() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(KOSONG)
  const [aktifId, setAktifId] = useState(state.ekskul[0]?.id || '')

  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelasId)
  const aktif = state.ekskul.find((e) => e.id === aktifId) || state.ekskul[0]

  const save = () => {
    if (!form.nama.trim()) return alert('Nama ekstrakurikuler wajib diisi.')
    if (modal === 'new') {
      const e = { id: uid(), nilai: {}, wajib: false, ...form }
      for (const s of state.siswa) e.nilai[s.id] = { nilai: 0, deskripsi: '' }
      dispatch({ type: 'SET', key: 'ekskul', value: [...state.ekskul, e] })
      setAktifId(e.id)
    } else {
      dispatch({ type: 'SET', key: 'ekskul', value: state.ekskul.map((x) => (x.id === modal.id ? { ...x, ...form } : x)) })
    }
    setModal(null)
  }

  const hapus = (e) => {
    if (!window.confirm(`Hapus ekstrakurikuler "${e.nama}"?`)) return
    dispatch({ type: 'SET', key: 'ekskul', value: state.ekskul.filter((x) => x.id !== e.id) })
    if (aktifId === e.id) setAktifId('')
  }

  const updateNilai = (siswaId, field, val) => {
    const ekskul = deepClone(state.ekskul)
    const idx = ekskul.findIndex((x) => x.id === aktif.id)
    ekskul[idx].nilai[siswaId] = ekskul[idx].nilai[siswaId] || { nilai: 0, deskripsi: '' }
    if (field === 'nilai') {
      ekskul[idx].nilai[siswaId].nilai = val === '' ? '' : Math.min(Math.max(Number(val), 0), 100)
    } else {
      ekskul[idx].nilai[siswaId].deskripsi = val
    }
    dispatch({ type: 'SET', key: 'ekskul', value: ekskul })
  }

  return (
    <div>
      <PageHeader
        title="Ekstrakurikuler"
        subtitle="Kegiatan ekstrakurikuler peserta didik beserta nilai dan deskripsi. Sesuai Permendikdasmen No. 13 Tahun 2025, satuan pendidikan wajib menyediakan ekstrakurikuler berbasis kepanduan (kepramukaan)."
        actions={
          <Button onClick={() => { setForm(KOSONG); setModal('new') }}>
            <Plus size={15} /> Tambah Ekstrakurikuler
          </Button>
        }
      />

      <Card className="mb-6 flex items-start gap-3 border-l-4 border-l-emerald-500 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-slate-600">
          <strong>Pramuka (Kepanduan)</strong> merupakan ekstrakurikuler wajib yang harus disediakan satuan pendidikan untuk menanamkan kemandirian, kepemimpinan,
          kerja sama, dan tanggung jawab sosial.
        </p>
      </Card>

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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {state.ekskul.map((e) => (
            <div
              key={e.id}
              className={cx(
                'group flex cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white p-3 shadow-sm',
                e.id === aktif?.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200',
              )}
              onClick={() => setAktifId(e.id)}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-800">
                  {e.nama}
                  {e.wajib && <Badge tone="emerald">Wajib</Badge>}
                </p>
                <p className="truncate text-[11px] text-slate-400">Pembina: {e.pembina || '-'}</p>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded p-1 hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); setForm({ ...KOSONG, ...e }); setModal(e) }}>
                  <Pencil size={13} />
                </button>
                <button className="rounded p-1 text-rose-500 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); hapus(e) }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {state.ekskul.length === 0 && <EmptyState icon={<Trophy size={32} />} title="Belum ada ekstrakurikuler" />}
        </div>

        <div className="lg:col-span-2">
          {aktif ? (
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{aktif.nama}</h2>
                  <Badge tone={aktif.wajib ? 'emerald' : 'sky'}>{aktif.wajib ? 'Wajib disediakan' : 'Ekstrakurikuler'}</Badge>
                </div>
                {aktif.keterangan && <p className="mt-1 text-xs italic text-slate-500">{aktif.keterangan}</p>}
              </div>
              <div className="max-h-[28rem] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">Peserta Didik</th>
                      <th className="w-24 px-3 py-2.5 text-center font-semibold">Nilai (0–100)</th>
                      <th className="px-3 py-2.5 font-semibold">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaKelas.map((s) => {
                      const v = aktif.nilai?.[s.id] || { nilai: 0, deskripsi: '' }
                      return (
                        <tr key={s.id} className="border-b border-slate-100">
                          <td className="px-5 py-2 font-semibold text-slate-800">{s.nama}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={v.nilai ?? ''}
                              onChange={(e) => updateNilai(s.id, 'nilai', e.target.value)}
                              className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-center text-sm outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.deskripsi ?? ''}
                              onChange={(e) => updateNilai(s.id, 'deskripsi', e.target.value)}
                              placeholder="Deskripsi pencapaian..."
                              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState icon={<Trophy size={32} />} title="Pilih atau buat ekstrakurikuler" />
          )}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'Tambah Ekstrakurikuler' : 'Ubah Ekstrakurikuler'}>
        <div className="grid gap-4">
          <Field label="Nama Ekstrakurikuler">
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </Field>
          <Field label="Pembina">
            <Input value={form.pembina} onChange={(e) => setForm({ ...form, pembina: e.target.value })} />
          </Field>
          <Field label="Keterangan">
            <Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal(null)}>
            Batal
          </Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </Modal>
    </div>
  )
}
