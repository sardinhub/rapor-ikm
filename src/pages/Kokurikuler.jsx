import { useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Sunrise, Info } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState, cx } from '../components/ui'
import { useStore, deepClone } from '../store'
import { uid } from '../lib/utils'

const KOSONG = { nama: '', jenis: 'Projek Kokurikuler', deskripsi: '' }

const KEBIASAAN = ['Bangun Pagi', 'Beribadah', 'Berolahraga', 'Makan Sehat & Bergizi', 'Gemar Belajar', 'Bermasyarakat', 'Tidur Cepat']

export default function Kokurikuler() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(KOSONG)
  const [aktifId, setAktifId] = useState(state.kokurikuler[0]?.id || '')

  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelasId)
  const aktif = state.kokurikuler.find((k) => k.id === aktifId) || state.kokurikuler[0]

  const save = () => {
    if (!form.nama.trim()) return alert('Nama kegiatan wajib diisi.')
    if (modal === 'new') {
      const k = { id: uid(), hasil: {}, ...form }
      for (const s of state.siswa) k.hasil[s.id] = ''
      dispatch({ type: 'SET', key: 'kokurikuler', value: [...state.kokurikuler, k] })
      setAktifId(k.id)
    } else {
      dispatch({
        type: 'SET',
        key: 'kokurikuler',
        value: state.kokurikuler.map((k) => (k.id === modal.id ? { ...k, ...form } : k)),
      })
    }
    setModal(null)
  }

  const hapus = (k) => {
    if (!window.confirm(`Hapus kegiatan "${k.nama}"?`)) return
    dispatch({ type: 'SET', key: 'kokurikuler', value: state.kokurikuler.filter((x) => x.id !== k.id) })
    if (aktifId === k.id) setAktifId('')
  }

  const updateHasil = (siswaId, text) => {
    dispatch({
      type: 'SET',
      key: 'kokurikuler',
      value: state.kokurikuler.map((k) => (k.id === aktif.id ? { ...k, hasil: { ...k.hasil, [siswaId]: text } } : k)),
    })
  }

  return (
    <div>
      <PageHeader
        title="Kegiatan Kokurikuler"
        subtitle="Kegiatan kokurikuler yang lebih fleksibel sesuai Permendikdasmen No. 13 Tahun 2025: pembelajaran kolaboratif lintas mata pelajaran, integrasi Gerakan 7 Kebiasaan Anak Indonesia Hebat, dan bentuk penguatan lainnya."
        actions={
          <Button onClick={() => { setForm(KOSONG); setModal('new') }}>
            <Plus size={15} /> Tambah Kegiatan
          </Button>
        }
      />

      <Card className="mb-6 flex items-start gap-3 border-l-4 border-l-amber-500 p-4">
        <Sunrise size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-xs leading-relaxed text-slate-600">
          <strong>Gerakan 7 Kebiasaan Anak Indonesia Hebat:</strong>{' '}
          {KEBIASAAN.join(' · ')}. Pembiasaan ini dapat diintegrasikan ke dalam kegiatan kokurikuler harian sekolah.
        </div>
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
          {state.kokurikuler.map((k) => (
            <div
              key={k.id}
              className={cx(
                'group flex cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white p-3 shadow-sm',
                k.id === aktif?.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200',
              )}
              onClick={() => setAktifId(k.id)}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{k.nama}</p>
                <p className="text-[11px] text-slate-400">{k.jenis}</p>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded p-1 hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); setForm({ ...KOSONG, ...k }); setModal(k) }}>
                  <Pencil size={13} />
                </button>
                <button className="rounded p-1 text-rose-500 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); hapus(k) }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {state.kokurikuler.length === 0 && (
            <EmptyState icon={<Sparkles size={32} />} title="Belum ada kegiatan kokurikuler" />
          )}
        </div>

        <div className="lg:col-span-2">
          {aktif ? (
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{aktif.nama}</h2>
                  <Badge tone="sky">{aktif.jenis}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">{aktif.deskripsi}</p>
              </div>
              <div className="max-h-[28rem] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">Peserta Didik</th>
                      <th className="px-3 py-2.5 font-semibold">Hasil / Peran / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaKelas.map((s) => (
                      <tr key={s.id} className="border-b border-slate-100">
                        <td className="w-1/3 px-5 py-2 font-semibold text-slate-800">{s.nama}</td>
                        <td className="px-3 py-2">
                          <textarea
                            rows={2}
                            value={aktif.hasil?.[s.id] ?? ''}
                            onChange={(e) => updateHasil(s.id, e.target.value)}
                            placeholder="Tuliskan hasil, peran, dan keterangan peserta didik..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState icon={<Sparkles size={32} />} title="Pilih atau buat kegiatan kokurikuler" />
          )}
        </div>
      </div>

      <Card className="mt-6 flex items-start gap-3 border-l-4 border-l-sky-500 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-sky-600" />
        <p className="text-xs leading-relaxed text-slate-600">
          <strong>Catatan regulasi:</strong> Permendikdasmen No. 13 Tahun 2025 menyederhanakan pelaksanaan kokurikuler dan mengintegrasikannya dengan pembelajaran
          berbasis proyek/tematik agar lebih efisien, kontekstual, dan menyenangkan, tanpa mengurangi capaian pembelajaran.
        </p>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'new' ? 'Tambah Kegiatan Kokurikuler' : 'Ubah Kegiatan'}>
        <div className="grid gap-4">
          <Field label="Nama Kegiatan">
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </Field>
          <Field label="Jenis">
            <Select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
              {['Projek Kokurikuler', 'Integrasi Karakter', 'Gerakan 7 Kebiasaan', 'Kolaborasi Lintas Mapel', 'Lainnya'].map((j) => (
                <option key={j}>{j}</option>
              ))}
            </Select>
          </Field>
          <Field label="Deskripsi Kegiatan">
            <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
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
