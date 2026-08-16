import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, School, Eraser } from 'lucide-react'
import { Card, Button, Input, Select, Field, Modal, PageHeader, Badge, EmptyState, cx } from '../components/ui'
import { useStore } from '../store'
import { uid } from '../lib/utils'
import { hapusSemuaSiswa, hapusSemuaKelas } from '../lib/cleanup'

const KOSONG_SISWA = {
  nisn: '',
  nis: '',
  nama: '',
  tempatLahir: '',
  tglLahir: '',
  jenisKelamin: 'L',
  agama: 'Islam',
  alamat: '',
  namaAyah: '',
  namaIbu: '',
  pekerjaanAyah: '',
  pekerjaanIbu: '',
}

const KOSONG_KELAS = { nama: '', fase: 'D', waliKelas: '', nipWali: '' }

export default function KelasSiswa() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [modalSiswa, setModalSiswa] = useState(null) // null | 'new' | siswa
  const [modalKelas, setModalKelas] = useState(null) // null | 'new' | kelas
  const [formSiswa, setFormSiswa] = useState(KOSONG_SISWA)
  const [formKelas, setFormKelas] = useState(KOSONG_KELAS)

  const kelas = state.kelas.find((k) => k.id === kelasId) || state.kelas[0]
  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelas?.id)

  // ---- Kelas ----
  const saveKelas = () => {
    if (!formKelas.nama.trim()) return alert('Nama kelas wajib diisi.')
    if (modalKelas === 'new') {
      const k = { id: uid(), ...formKelas }
      dispatch({ type: 'SET', key: 'kelas', value: [...state.kelas, k] })
      setKelasId(k.id)
    } else {
      dispatch({
        type: 'SET',
        key: 'kelas',
        value: state.kelas.map((k) => (k.id === modalKelas.id ? { ...k, ...formKelas } : k)),
      })
    }
    setModalKelas(null)
  }

  const hapusKelas = (k) => {
    if (!window.confirm(`Hapus kelas ${k.nama} beserta seluruh siswanya?`)) return
    dispatch({ type: 'SET', key: 'kelas', value: state.kelas.filter((x) => x.id !== k.id) })
    dispatch({ type: 'SET', key: 'siswa', value: state.siswa.filter((s) => s.kelasId !== k.id) })
    setModalKelas(null)
    if (kelasId === k.id) setKelasId(state.kelas.find((x) => x.id !== k.id)?.id || '')
  }

  // ---- Siswa ----
  const saveSiswa = () => {
    if (!formSiswa.nama.trim()) return alert('Nama siswa wajib diisi.')
    if (modalSiswa === 'new') {
      dispatch({ type: 'SET', key: 'siswa', value: [...state.siswa, { id: uid(), kelasId: kelas.id, ...formSiswa }] })
    } else {
      dispatch({
        type: 'SET',
        key: 'siswa',
        value: state.siswa.map((s) => (s.id === modalSiswa.id ? { ...s, ...formSiswa } : s)),
      })
    }
    setModalSiswa(null)
  }

  const hapusSiswa = (s) => {
    if (!window.confirm(`Hapus siswa ${s.nama}?`)) return
    dispatch({ type: 'SET', key: 'siswa', value: state.siswa.filter((x) => x.id !== s.id) })
  }

  const hapusSemuaSiswaKelas = () => {
    if (state.siswa.length === 0) return
    if (!window.confirm('Hapus SEMUA siswa beserta nilai, kehadiran, profil lulusan, dan catatannya? Kelas tetap dipertahankan.')) return
    const r = hapusSemuaSiswa(state, state.siswa)
    dispatch({ type: 'SET', key: 'siswa', value: [] })
    for (const [k, v] of Object.entries(r)) dispatch({ type: 'SET', key: k, value: v })
  }

  const hapusSemuaKelasSiswa = () => {
    if (state.kelas.length === 0) return
    if (!window.confirm('Hapus SEMUA kelas beserta siswa, mata pelajaran, nilai, dan seluruh data terkait? (Profil sekolah & kegiatan tetap ada)')) return
    const r = hapusSemuaKelas(state)
    for (const [k, v] of Object.entries(r)) dispatch({ type: 'SET', key: k, value: v })
    setKelasId('')
  }

  const openSiswa = (s) => {
    setFormSiswa(s === 'new' ? KOSONG_SISWA : { ...KOSONG_SISWA, ...s })
    setModalSiswa(s)
  }

  const openKelas = (k) => {
    setFormKelas(k === 'new' ? KOSONG_KELAS : { ...KOSONG_KELAS, ...k })
    setModalKelas(k)
  }

  return (
    <div>
      <PageHeader
        title="Kelas & Peserta Didik"
        subtitle="Kelola rombongan belajar (rombel) dan data peserta didik. Data yang tercantum menjadi identitas pada rapor."
        actions={
          <>
            <Button variant="secondary" onClick={hapusSemuaSiswaKelas} disabled={state.siswa.length === 0}>
              <Eraser size={15} /> Hapus Semua Siswa
            </Button>
            <Button variant="danger" onClick={hapusSemuaKelasSiswa} disabled={state.kelas.length === 0}>
              <Trash2 size={15} /> Hapus Semua Kelas & Data
            </Button>
            <Button onClick={() => openKelas('new')}>
              <Plus size={15} /> Tambah Kelas
            </Button>
          </>
        }
      />

      {/* Pilihan kelas */}
      <div className="no-print mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {state.kelas.map((k) => {
          const jml = state.siswa.filter((s) => s.kelasId === k.id).length
          const aktif = k.id === kelas?.id
          return (
            <div
              key={k.id}
              role="button"
              tabIndex={0}
              onClick={() => setKelasId(k.id)}
              onKeyDown={(e) => e.key === 'Enter' && setKelasId(k.id)}
              className={cx(
                'cursor-pointer rounded-xl border bg-white p-4 text-left shadow-sm transition-colors',
                aktif ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{k.nama}</span>
                <Badge tone={aktif ? 'emerald' : 'slate'}>Fase {k.fase}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Users size={12} /> {jml} peserta didik
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">{k.waliKelas}</p>
              <div className="mt-2 flex gap-1">
                <Button variant="ghost" className="px-2 py-1 text-xs" onClick={(e) => { e.stopPropagation(); openKelas(k) }}>
                  <Pencil size={13} /> Ubah
                </Button>
                <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600" onClick={(e) => { e.stopPropagation(); hapusKelas(k) }}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabel siswa */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 no-print">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <School size={16} className="text-emerald-600" />
            Peserta Didik — Kelas {kelas?.nama} ({kelas?.fase ? `Fase ${kelas.fase}` : ''})
          </h2>
          <Button onClick={() => openSiswa('new')}>
            <Plus size={15} /> Tambah Peserta Didik
          </Button>
        </div>

        {siswaKelas.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users size={36} />}
              title="Belum ada peserta didik"
              desc="Tambahkan peserta didik pada kelas ini untuk mulai mengisi nilai dan mencetak rapor."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">NISN</th>
                  <th className="px-3 py-2.5 font-semibold">Nama Peserta Didik</th>
                  <th className="px-3 py-2.5 font-semibold">L/P</th>
                  <th className="px-3 py-2.5 font-semibold">Tempat, Tanggal Lahir</th>
                  <th className="px-3 py-2.5 font-semibold">Agama</th>
                  <th className="px-3 py-2.5 font-semibold">Nama Ayah</th>
                  <th className="px-3 py-2.5 font-semibold">Nama Ibu</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaKelas.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-2.5 text-slate-500">{s.nisn}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{s.nama}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.jenisKelamin}</td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {s.tempatLahir}, {s.tglLahir}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{s.agama}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.namaAyah}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.namaIbu}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => openSiswa(s)}>
                          <Pencil size={13} /> Ubah
                        </Button>
                        <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600" onClick={() => hapusSiswa(s)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Kelas */}
      <Modal open={!!modalKelas} onClose={() => setModalKelas(null)} title={modalKelas === 'new' ? 'Tambah Kelas' : `Ubah Kelas ${modalKelas?.nama || ''}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Kelas (cth: 7A)">
            <Input value={formKelas.nama} onChange={(e) => setFormKelas({ ...formKelas, nama: e.target.value })} />
          </Field>
          <Field label="Fase">
            <Select value={formKelas.fase} onChange={(e) => setFormKelas({ ...formKelas, fase: e.target.value })}>
              {['A', 'B', 'C', 'D', 'E', 'F'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </Field>
          <Field label="Wali Kelas">
            <Input value={formKelas.waliKelas} onChange={(e) => setFormKelas({ ...formKelas, waliKelas: e.target.value })} />
          </Field>
          <Field label="NIP Wali Kelas">
            <Input value={formKelas.nipWali} onChange={(e) => setFormKelas({ ...formKelas, nipWali: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalKelas(null)}>
            Batal
          </Button>
          <Button onClick={saveKelas}>Simpan</Button>
        </div>
      </Modal>

      {/* Modal Siswa */}
      <Modal open={!!modalSiswa} onClose={() => setModalSiswa(null)} title={modalSiswa === 'new' ? 'Tambah Peserta Didik' : `Ubah ${modalSiswa?.nama || ''}`} wide>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="NISN">
            <Input value={formSiswa.nisn} onChange={(e) => setFormSiswa({ ...formSiswa, nisn: e.target.value })} />
          </Field>
          <Field label="NIS / Nomor Induk">
            <Input value={formSiswa.nis} onChange={(e) => setFormSiswa({ ...formSiswa, nis: e.target.value })} />
          </Field>
          <Field label="Jenis Kelamin">
            <Select value={formSiswa.jenisKelamin} onChange={(e) => setFormSiswa({ ...formSiswa, jenisKelamin: e.target.value })}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </Select>
          </Field>
          <Field label="Nama Lengkap" className="sm:col-span-2">
            <Input value={formSiswa.nama} onChange={(e) => setFormSiswa({ ...formSiswa, nama: e.target.value })} />
          </Field>
          <Field label="Agama">
            <Select value={formSiswa.agama} onChange={(e) => setFormSiswa({ ...formSiswa, agama: e.target.value })}>
              {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tempat Lahir">
            <Input value={formSiswa.tempatLahir} onChange={(e) => setFormSiswa({ ...formSiswa, tempatLahir: e.target.value })} />
          </Field>
          <Field label="Tanggal Lahir">
            <Input type="date" value={formSiswa.tglLahir} onChange={(e) => setFormSiswa({ ...formSiswa, tglLahir: e.target.value })} />
          </Field>
          <Field label="Alamat" className="sm:col-span-3">
            <Input value={formSiswa.alamat} onChange={(e) => setFormSiswa({ ...formSiswa, alamat: e.target.value })} />
          </Field>
          <Field label="Nama Ayah">
            <Input value={formSiswa.namaAyah} onChange={(e) => setFormSiswa({ ...formSiswa, namaAyah: e.target.value })} />
          </Field>
          <Field label="Pekerjaan Ayah">
            <Input value={formSiswa.pekerjaanAyah} onChange={(e) => setFormSiswa({ ...formSiswa, pekerjaanAyah: e.target.value })} />
          </Field>
          <Field label="Nama Ibu">
            <Input value={formSiswa.namaIbu} onChange={(e) => setFormSiswa({ ...formSiswa, namaIbu: e.target.value })} />
          </Field>
          <Field label="Pekerjaan Ibu">
            <Input value={formSiswa.pekerjaanIbu} onChange={(e) => setFormSiswa({ ...formSiswa, pekerjaanIbu: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalSiswa(null)}>
            Batal
          </Button>
          <Button onClick={saveSiswa}>Simpan</Button>
        </div>
      </Modal>
    </div>
  )
}
