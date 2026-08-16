import { useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, Target, ListChecks, PenLine, Eraser } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState, cx } from '../components/ui'
import { useStore, deepClone } from '../store'
import { rataRataNilai, predikat, deskripsiOtomatis, uid } from '../lib/utils'
import { hapusSemuaMapel } from '../lib/cleanup'

const KOSONG_MAPEL = { kode: '', nama: '', kkm: 70, guru: '', pilihan: false, keterangan: '' }
const KOSONG_TP = { kode: '', deskripsi: '' }

export default function MapelNilai() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [mapelId, setMapelId] = useState(state.mapel.find((m) => m.kelasId === kelasId)?.id || '')

  const [modalMapel, setModalMapel] = useState(null)
  const [formMapel, setFormMapel] = useState(KOSONG_MAPEL)
  const [modalTp, setModalTp] = useState(null)
  const [formTp, setFormTp] = useState(KOSONG_TP)
  const [editDeskripsi, setEditDeskripsi] = useState(null) // siswaId yang sedang diedit deskripsinya

  const kelas = state.kelas.find((k) => k.id === kelasId) || state.kelas[0]
  const mapelKelas = state.mapel.filter((m) => m.kelasId === kelas?.id)
  const mapel = mapelKelas.find((m) => m.id === mapelId) || mapelKelas[0]
  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelas?.id)

  const pilihKelas = (id) => {
    setKelasId(id)
    setMapelId(state.mapel.find((m) => m.kelasId === id)?.id || '')
  }

  const updateNilai = (siswaId, tpId, val) => {
    const nilai = deepClone(state.nilai)
    nilai[mapel.id] = nilai[mapel.id] || {}
    nilai[mapel.id][siswaId] = nilai[mapel.id][siswaId] || {}
    nilai[mapel.id][siswaId][tpId] = val === '' ? '' : Math.min(Math.max(Number(val), 0), 100)
    dispatch({ type: 'SET', key: 'nilai', value: nilai })
  }

  const updateDeskripsi = (siswaId, text) => {
    const deskripsi = deepClone(state.deskripsi || {})
    deskripsi[mapel.id] = deskripsi[mapel.id] || {}
    deskripsi[mapel.id][siswaId] = text
    dispatch({ type: 'SET', key: 'deskripsi', value: deskripsi })
  }

  // ---- Mapel ----
  const saveMapel = () => {
    if (!formMapel.nama.trim()) return alert('Nama mata pelajaran wajib diisi.')
    if (modalMapel === 'new') {
      const m = { id: uid(), kelasId: kelas.id, tp: [], ...formMapel }
      dispatch({ type: 'SET', key: 'mapel', value: [...state.mapel, m] })
      setMapelId(m.id)
    } else {
      dispatch({
        type: 'SET',
        key: 'mapel',
        value: state.mapel.map((m) => (m.id === modalMapel.id ? { ...m, ...formMapel } : m)),
      })
    }
    setModalMapel(null)
  }

  const hapusMapel = (m) => {
    if (!window.confirm(`Hapus mata pelajaran ${m.nama} beserta seluruh nilainya?`)) return
    dispatch({ type: 'SET', key: 'mapel', value: state.mapel.filter((x) => x.id !== m.id) })
    const nilai = deepClone(state.nilai)
    delete nilai[m.id]
    dispatch({ type: 'SET', key: 'nilai', value: nilai })
  }

  const openMapel = (m) => {
    setFormMapel(m === 'new' ? KOSONG_MAPEL : { ...KOSONG_MAPEL, ...m })
    setModalMapel(m)
  }

  // ---- TP ----
  const saveTp = () => {
    if (!formTp.deskripsi.trim()) return alert('Deskripsi tujuan pembelajaran wajib diisi.')
    const tpBaru = { id: uid(), kode: formTp.kode || `TP ${mapel.tp.length + 1}`, deskripsi: formTp.deskripsi }
    dispatch({
      type: 'SET',
      key: 'mapel',
      value: state.mapel.map((m) => (m.id === mapel.id ? { ...m, tp: [...m.tp, tpBaru] } : m)),
    })
    setModalTp(null)
  }

  const hapusSemuaMapelNilai = () => {
    if (state.mapel.length === 0) return
    if (!window.confirm('Hapus SEMUA mata pelajaran beserta tujuan pembelajaran, nilai, dan deskripsi manual?')) return
    const r = hapusSemuaMapel()
    for (const [k, v] of Object.entries(r)) dispatch({ type: 'SET', key: k, value: v })
    setMapelId('')
  }

  const hapusTp = (tp) => {
    if (!window.confirm(`Hapus tujuan pembelajaran "${tp.kode}" beserta nilainya?`)) return
    dispatch({
      type: 'SET',
      key: 'mapel',
      value: state.mapel.map((m) => (m.id === mapel.id ? { ...m, tp: m.tp.filter((t) => t.id !== tp.id) } : m)),
    })
    const nilai = deepClone(state.nilai)
    for (const sId of Object.keys(nilai[mapel.id] || {})) delete nilai[mapel.id][sId][tp.id]
    dispatch({ type: 'SET', key: 'nilai', value: nilai })
  }

  if (!kelas) {
    return (
      <EmptyState
        icon={<BookOpen size={36} />}
        title="Belum ada kelas"
        desc="Buat kelas terlebih dahulu melalui menu Kelas & Siswa."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Mata Pelajaran & Nilai"
        subtitle="Capaian Pembelajaran (CP) diurai menjadi Tujuan Pembelajaran (TP). Masukkan nilai asesmen sumatif per TP; nilai akhir dan predikat dihitung otomatis."
        actions={
          <>
            <Button variant="danger" onClick={hapusSemuaMapelNilai} disabled={state.mapel.length === 0}>
              <Eraser size={15} /> Hapus Semua Mapel & Nilai
            </Button>
            <Button onClick={() => openMapel('new')}>
              <Plus size={15} /> Tambah Mata Pelajaran
            </Button>
          </>
        }
      />

      <div className="no-print mb-4 flex flex-wrap items-center gap-3">
        <Field label="Pilih Kelas" className="w-56">
          <Select value={kelas.id} onChange={(e) => pilihKelas(e.target.value)}>
            {state.kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama} (Fase {k.fase})
              </option>
            ))}
          </Select>
        </Field>
        {mapel && (
          <Badge tone="emerald">
            {mapelKelas.length} mata pelajaran · {mapel.tp.length} TP pada mapel terpilih
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Daftar mapel */}
        <Card className="no-print self-start p-3 lg:col-span-1">
          <h3 className="mb-2 px-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-500">Daftar Mata Pelajaran</h3>
          <div className="space-y-1">
            {mapelKelas.map((m) => (
              <div
                key={m.id}
                className={cx(
                  'group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm',
                  m.id === mapel?.id ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-700',
                )}
                onClick={() => setMapelId(m.id)}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {m.kode} {m.pilihan && <span className={m.id === mapel?.id ? 'text-emerald-100' : 'text-amber-600'}>· Pilihan</span>}
                  </p>
                  <p className={cx('truncate text-[11px]', m.id === mapel?.id ? 'text-emerald-100' : 'text-slate-400')}>{m.nama}</p>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className={cx('rounded p-1', m.id === mapel?.id ? 'hover:bg-emerald-500' : 'hover:bg-slate-200')} onClick={(e) => { e.stopPropagation(); openMapel(m) }}>
                    <Pencil size={13} />
                  </button>
                  <button className={cx('rounded p-1', m.id === mapel?.id ? 'hover:bg-emerald-500 text-emerald-100' : 'hover:bg-slate-200 text-rose-500')} onClick={(e) => { e.stopPropagation(); hapusMapel(m) }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {mapelKelas.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">Belum ada mapel.</p>}
          </div>
        </Card>

        {/* Detail mapel */}
        <div className="space-y-6 lg:col-span-3">
          {mapel ? (
            <>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{mapel.nama}</h2>
                      {mapel.pilihan && <Badge tone="amber">Mapel Pilihan · Koding & AI</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {mapel.kode} · Kelas {kelas.nama} (Fase {kelas.fase}) · Guru: {mapel.guru || '-'} · KKM: {mapel.kkm}
                    </p>
                    {mapel.keterangan && <p className="mt-1 text-xs italic text-slate-400">{mapel.keterangan}</p>}
                  </div>
                  <Button variant="secondary" onClick={() => openMapel(mapel)}>
                    <Pencil size={14} /> Ubah Mapel
                  </Button>
                </div>
              </Card>

              {/* TP */}
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Target size={16} className="text-emerald-600" /> Tujuan Pembelajaran (TP)
                  </h3>
                  <Button variant="secondary" onClick={() => { setFormTp(KOSONG_TP); setModalTp('new') }}>
                    <Plus size={14} /> Tambah TP
                  </Button>
                </div>
                {mapel.tp.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada TP. Tambahkan TP untuk mulai mengisi nilai.</p>
                ) : (
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                    {mapel.tp.map((tp) => (
                      <li key={tp.id} className="group flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <strong className="text-slate-800">{tp.kode}.</strong> {tp.deskripsi}
                        </span>
                        <button className="shrink-0 rounded p-1 text-rose-500 opacity-0 transition-opacity hover:bg-rose-50 group-hover:opacity-100" onClick={() => hapusTp(tp)}>
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>

              {/* Matriks nilai */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <ListChecks size={16} className="text-emerald-600" /> Matriks Nilai Sumatif per TP
                  </h3>
                  <Badge tone="sky">Nilai 0–100 · Predikat otomatis</Badge>
                </div>
                {siswaKelas.length === 0 ? (
                  <div className="p-5">
                    <EmptyState icon={<ListChecks size={32} />} title="Belum ada peserta didik di kelas ini" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="sticky left-0 z-10 bg-slate-50 px-5 py-2.5 font-semibold">Peserta Didik</th>
                          {mapel.tp.map((tp) => (
                            <th key={tp.id} className="min-w-[110px] px-2 py-2.5 text-center font-semibold" title={tp.deskripsi}>
                              {tp.kode}
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center font-semibold">Nilai Akhir</th>
                          <th className="px-3 py-2.5 text-center font-semibold">Predikat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siswaKelas.map((s) => {
                          const tpNilai = state.nilai[mapel.id]?.[s.id] || {}
                          const rata = rataRataNilai(tpNilai)
                          return (
                            <tr key={s.id} className="border-b border-slate-100">
                              <td className="sticky left-0 z-10 max-w-[200px] truncate bg-white px-5 py-1.5 font-semibold text-slate-800">
                                {s.nama}
                              </td>
                              {mapel.tp.map((tp) => (
                                <td key={tp.id} className="px-1.5 py-1.5 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={tpNilai[tp.id] ?? ''}
                                    onChange={(e) => updateNilai(s.id, tp.id, e.target.value)}
                                    className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-center text-sm outline-none focus:border-emerald-500"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-1.5 text-center font-bold text-slate-900">{rata ?? '-'}</td>
                              <td className="px-3 py-1.5 text-center">
                                <Badge tone={rata == null ? 'slate' : rata >= 80 ? 'emerald' : rata >= 70 ? 'amber' : 'rose'}>
                                  {rata == null ? '-' : predikat(rata, state.sekolah)}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Deskripsi capaian */}
              <Card className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <PenLine size={16} className="text-emerald-600" /> Deskripsi Capaian Kompetensi (Rapor)
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  Deskripsi dibuat otomatis dari nilai rata-rata TP. Klik <em>Edit</em> untuk menuliskan deskripsi manual sesuai capaian peserta didik.
                </p>
                <div className="space-y-2">
                  {siswaKelas.map((s) => {
                    const tpNilai = state.nilai[mapel.id]?.[s.id] || {}
                    const rata = rataRataNilai(tpNilai)
                    const override = state.deskripsi?.[mapel.id]?.[s.id]
                    const editing = editDeskripsi === s.id
                    return (
                      <div key={s.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{s.nama}</p>
                          <div className="flex items-center gap-2">
                            <Badge tone={rata == null ? 'slate' : rata >= 80 ? 'emerald' : 'amber'}>
                              {rata == null ? '-' : `Rata-rata ${rata}`}
                            </Badge>
                            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditDeskripsi(editing ? null : s.id)}>
                              {editing ? 'Selesai' : override ? 'Edit Manual' : 'Edit'}
                            </Button>
                          </div>
                        </div>
                        {editing ? (
                          <textarea
                            rows={2}
                            defaultValue={override ?? ''}
                            placeholder={deskripsiOtomatis(mapel, rata, state.sekolah)}
                            onBlur={(e) => updateDeskripsi(s.id, e.target.value)}
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {override || deskripsiOtomatis(mapel, rata, state.sekolah)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={<BookOpen size={36} />}
              title="Belum ada mata pelajaran"
              desc="Tambahkan mata pelajaran pada kelas ini."
            >
              <Button onClick={() => openMapel('new')}>
                <Plus size={15} /> Tambah Mata Pelajaran
              </Button>
            </EmptyState>
          )}
        </div>
      </div>

      {/* Modal Mapel */}
      <Modal open={!!modalMapel} onClose={() => setModalMapel(null)} title={modalMapel === 'new' ? 'Tambah Mata Pelajaran' : 'Ubah Mata Pelajaran'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kode">
            <Input value={formMapel.kode} onChange={(e) => setFormMapel({ ...formMapel, kode: e.target.value })} placeholder="cth: MTK" />
          </Field>
          <Field label="KKM / Kriteria Ketercapaian">
            <Input type="number" value={formMapel.kkm} onChange={(e) => setFormMapel({ ...formMapel, kkm: Number(e.target.value) })} />
          </Field>
          <Field label="Nama Mata Pelajaran" className="sm:col-span-2">
            <Input value={formMapel.nama} onChange={(e) => setFormMapel({ ...formMapel, nama: e.target.value })} />
          </Field>
          <Field label="Guru Pengampu" className="sm:col-span-2">
            <Input value={formMapel.guru} onChange={(e) => setFormMapel({ ...formMapel, guru: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input type="checkbox" checked={formMapel.pilihan} onChange={(e) => setFormMapel({ ...formMapel, pilihan: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
            Mata pelajaran pilihan (mis. Koding dan Kecerdasan Artifisial)
          </label>
          {formMapel.pilihan && (
            <Field label="Keterangan Pilihan" className="sm:col-span-2">
              <Input value={formMapel.keterangan} onChange={(e) => setFormMapel({ ...formMapel, keterangan: e.target.value })} placeholder="cth: mapel pilihan mulai kelas 5, 7, 10" />
            </Field>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalMapel(null)}>
            Batal
          </Button>
          <Button onClick={saveMapel}>Simpan</Button>
        </div>
      </Modal>

      {/* Modal TP */}
      <Modal open={!!modalTp} onClose={() => setModalTp(null)} title={`Tambah TP — ${mapel?.nama || ''}`}>
        <div className="grid gap-4">
          <Field label="Kode TP">
            <Input value={formTp.kode} onChange={(e) => setFormTp({ ...formTp, kode: e.target.value })} placeholder={`cth: TP ${(mapel?.tp.length || 0) + 1}`} />
          </Field>
          <Field label="Deskripsi Tujuan Pembelajaran">
            <textarea rows={3} value={formTp.deskripsi} onChange={(e) => setFormTp({ ...formTp, deskripsi: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalTp(null)}>
            Batal
          </Button>
          <Button onClick={saveTp}>Simpan</Button>
        </div>
      </Modal>
    </div>
  )
}
