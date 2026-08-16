import { useState } from 'react'
import { Printer, ChevronLeft, ChevronRight, GraduationCap, Pencil, Eraser } from 'lucide-react'
import { Card, Button, Select, Field, PageHeader, Badge, EmptyState } from '../components/ui'
import { useStore } from '../store'
import { rataRataNilai, predikat, deskripsiOtomatis, formatTgl, tanggalSekarang, persenKehadiran } from '../lib/utils'

export default function Rapor() {
  const { state, dispatch } = useStore()
  const [kelasId, setKelasId] = useState(state.kelas[0]?.id || '')
  const [siswaId, setSiswaId] = useState(state.siswa[0]?.id || '')
  const [editCatatan, setEditCatatan] = useState(false)

  const sekolah = state.sekolah
  const kelas = state.kelas.find((k) => k.id === kelasId) || state.kelas[0]
  const siswaKelas = state.siswa.filter((s) => s.kelasId === kelas?.id)
  const siswa = siswaKelas.find((s) => s.id === siswaId) || siswaKelas[0]
  const idx = siswa ? siswaKelas.findIndex((s) => s.id === siswa.id) : -1

  const updateCatatan = (text) => {
    dispatch({ type: 'SET', key: 'catatanWali', value: { ...(state.catatanWali || {}), [siswa.id]: text } })
  }

  const bersihkanCatatan = () => {
    if (!window.confirm('Hapus SEMUA catatan wali kelas untuk seluruh peserta didik?')) return
    dispatch({ type: 'SET', key: 'catatanWali', value: {} })
  }

  if (!kelas || !siswa) {
    return <EmptyState icon={<GraduationCap size={36} />} title="Belum ada data" desc="Lengkapi kelas dan peserta didik terlebih dahulu." />
  }

  const mapelKelas = state.mapel.filter((m) => m.kelasId === kelas.id)
  const kehadiran = state.kehadiran?.[siswa.id] || { sakit: 0, izin: 0, alpha: 0 }
  const pctHadir = persenKehadiran(kehadiran, sekolah.hariEfektif)
  const catatan = state.catatanWali?.[siswa.id] || ''

  return (
    <div>
      <PageHeader
        title="Rapor & Cetak"
        subtitle="Pratinjau rapor sesuai format e-Rapor Kurikulum Merdeka (A4). Pilih peserta didik lalu klik Cetak / Simpan PDF."
        actions={
          <>
            <Button variant="secondary" onClick={bersihkanCatatan} disabled={state.siswa.length === 0}>
              <Eraser size={15} /> Bersihkan Catatan Wali
            </Button>
            <Button variant="secondary" onClick={() => setSiswaId(siswaKelas[Math.max(0, idx - 1)]?.id)} disabled={idx <= 0}>
              <ChevronLeft size={15} /> Sebelumnya
            </Button>
            <Button variant="secondary" onClick={() => setSiswaId(siswaKelas[Math.min(siswaKelas.length - 1, idx + 1)]?.id)} disabled={idx >= siswaKelas.length - 1}>
              Berikutnya <ChevronRight size={15} />
            </Button>
            <Button onClick={() => window.print()}>
              <Printer size={15} /> Cetak / Simpan PDF
            </Button>
          </>
        }
      />

      {/* Pemilih */}
      <div className="no-print mb-6 flex flex-wrap items-end gap-4">
        <Field label="Kelas" className="w-52">
          <Select value={kelas.id} onChange={(e) => { setKelasId(e.target.value); setSiswaId('') }}>
            {state.kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Peserta Didik" className="w-80">
          <Select value={siswa.id} onChange={(e) => setSiswaId(e.target.value)}>
            {siswaKelas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Badge tone="sky">
          {idx + 1} dari {siswaKelas.length} peserta didik
        </Badge>
      </div>

      {/* ====== LEMBAR RAPOR ====== */}
      <div className="print-area mx-auto w-[210mm] max-w-full rounded-xl border border-slate-300 bg-white p-10 shadow-lg">
        {/* Kop */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-slate-800 text-slate-800">
            <GraduationCap size={34} />
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold uppercase leading-tight text-slate-900">{sekolah.nama}</p>
            <p className="text-xs text-slate-600">
              {sekolah.alamat}, {sekolah.desa}, {sekolah.kecamatan}, {sekolah.kabupaten}, {sekolah.provinsi} {sekolah.kodePos}
            </p>
            <p className="text-xs text-slate-600">
              Telp. {sekolah.telp} · Email: {sekolah.email} · {sekolah.website}
            </p>
            <p className="text-xs text-slate-600">
              NPSN: {sekolah.npsn} · NSS: {sekolah.nss} · Akreditasi: {sekolah.akreditasi}
            </p>
          </div>
        </div>

        <div className="mt-3 border-t-2 border-b-2 border-slate-800 py-1 text-center">
          <p className="text-[15px] font-bold uppercase tracking-wide text-slate-900">Laporan Hasil Belajar Peserta Didik</p>
          <p className="text-sm font-semibold uppercase text-slate-700">Kurikulum Merdeka</p>
        </div>

        {/* Identitas */}
        <table className="mt-4 w-full text-[13px]">
          <tbody>
            <tr>
              <td className="w-1/2 align-top">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-40 py-1 text-slate-600">Nama Peserta Didik</td>
                      <td className="py-1 font-semibold text-slate-900">: {siswa.nama}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">NISN / NIS</td>
                      <td className="py-1 text-slate-900">: {siswa.nisn} / {siswa.nis}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Tempat, Tanggal Lahir</td>
                      <td className="py-1 text-slate-900">: {siswa.tempatLahir}, {formatTgl(siswa.tglLahir)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Jenis Kelamin</td>
                      <td className="py-1 text-slate-900">: {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Agama</td>
                      <td className="py-1 text-slate-900">: {siswa.agama}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Alamat</td>
                      <td className="py-1 text-slate-900">: {siswa.alamat}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Nama Orang Tua/Wali</td>
                      <td className="py-1 text-slate-900">
                        : {siswa.namaAyah} ({siswa.pekerjaanAyah}) &amp; {siswa.namaIbu} ({siswa.pekerjaanIbu})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="w-1/2 align-top">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-40 py-1 text-slate-600">Nama Sekolah</td>
                      <td className="py-1 font-semibold text-slate-900">: {sekolah.nama}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">NPSN</td>
                      <td className="py-1 text-slate-900">: {sekolah.npsn}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Kelas / Fase</td>
                      <td className="py-1 text-slate-900">: {kelas.nama} / Fase {kelas.fase}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Semester</td>
                      <td className="py-1 text-slate-900">: {sekolah.semester === 1 ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Tahun Pelajaran</td>
                      <td className="py-1 text-slate-900">: {sekolah.tahunPelajaran}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Wali Kelas</td>
                      <td className="py-1 text-slate-900">: {kelas.waliKelas}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Hasil belajar */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">Hasil Belajar</h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">No</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Mata Pelajaran</th>
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">Nilai Akhir</th>
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">Predikat</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Deskripsi Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            {mapelKelas.map((m, i) => {
              const rata = rataRataNilai(state.nilai[m.id]?.[siswa.id])
              const desk = state.deskripsi?.[m.id]?.[siswa.id] || deskripsiOtomatis(m, rata, sekolah)
              return (
                <tr key={m.id}>
                  <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                  <td className="border border-slate-400 px-3 py-1.5">
                    {m.nama}
                    {m.pilihan && <span className="text-[10px] italic text-amber-700"> (pilihan)</span>}
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold">{rata ?? '-'}</td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold">{rata == null ? '-' : predikat(rata, sekolah)}</td>
                  <td className="border border-slate-400 px-3 py-1.5 leading-snug text-slate-700">{desk}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Profil lulusan */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">
          Profil Lulusan <span className="font-medium normal-case">(8 dimensi — Permendikdasmen No. 10 Tahun 2025)</span>
        </h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">No</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Dimensi</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {state.dimensi.map((d, i) => (
              <tr key={d.id}>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-400 px-3 py-1.5 font-medium">{d.nama}</td>
                <td className="border border-slate-400 px-3 py-1.5 leading-snug text-slate-700">{state.profilLulusan?.[siswa.id]?.[d.id] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Kokurikuler */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">Kegiatan Kokurikuler</h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">No</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Kegiatan</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Hasil / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {state.kokurikuler.map((k, i) => (
              <tr key={k.id}>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-400 px-3 py-1.5">{k.nama}</td>
                <td className="border border-slate-400 px-3 py-1.5 leading-snug text-slate-700">{k.hasil?.[siswa.id] || '-'}</td>
              </tr>
            ))}
            {state.kokurikuler.length === 0 && (
              <tr>
                <td colSpan="3" className="border border-slate-400 px-3 py-1.5 text-center text-slate-400">Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Ekskul */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">Ekstrakurikuler</h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">No</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Kegiatan</th>
              <th className="border border-slate-400 px-2 py-1.5 text-center font-bold">Nilai</th>
              <th className="border border-slate-400 px-3 py-1.5 text-left font-bold">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {state.ekskul.map((e, i) => {
              const v = e.nilai?.[siswa.id] || {}
              return (
                <tr key={e.id}>
                  <td className="border border-slate-400 px-2 py-1.5 text-center">{i + 1}</td>
                  <td className="border border-slate-400 px-3 py-1.5">
                    {e.nama}
                    {e.wajib && <span className="text-[10px] italic text-emerald-700"> (wajib)</span>}
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold">{v.nilai ?? '-'}</td>
                  <td className="border border-slate-400 px-3 py-1.5 leading-snug text-slate-700">{v.deskripsi || '-'}</td>
                </tr>
              )
            })}
            {state.ekskul.length === 0 && (
              <tr>
                <td colSpan="4" className="border border-slate-400 px-3 py-1.5 text-center text-slate-400">Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Kehadiran */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">Kehadiran</h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-400 px-3 py-1.5 font-bold">Sakit</th>
              <th className="border border-slate-400 px-3 py-1.5 font-bold">Izin</th>
              <th className="border border-slate-400 px-3 py-1.5 font-bold">Tanpa Keterangan</th>
              <th className="border border-slate-400 px-3 py-1.5 font-bold">% Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-400 px-3 py-1.5 text-center">{kehadiran.sakit} hari</td>
              <td className="border border-slate-400 px-3 py-1.5 text-center">{kehadiran.izin} hari</td>
              <td className="border border-slate-400 px-3 py-1.5 text-center">{kehadiran.alpha} hari</td>
              <td className="border border-slate-400 px-3 py-1.5 text-center font-semibold">{pctHadir}%</td>
            </tr>
          </tbody>
        </table>

        {/* Catatan wali kelas */}
        <h3 className="mt-5 border-b border-slate-800 pb-0.5 text-[13px] font-bold uppercase text-slate-900">Catatan Wali Kelas</h3>
        {editCatatan ? (
          <div className="no-print mt-2">
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => updateCatatan(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <Button variant="secondary" className="mt-1" onClick={() => setEditCatatan(false)}>
              Selesai
            </Button>
          </div>
        ) : (
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="min-h-[3.5rem] flex-1 text-[12px] italic leading-relaxed text-slate-700">{catatan || 'Belum ada catatan.'}</p>
            <button className="no-print flex items-center gap-1 rounded p-1 text-xs text-slate-400 hover:bg-slate-100" onClick={() => setEditCatatan(true)}>
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}

        {/* Tanda tangan */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-[12px]">
          <div>
            <p>Mengetahui,</p>
            <p>Orang Tua/Wali Peserta Didik</p>
            <div className="h-16" />
            <p className="font-bold underline">{siswa.namaAyah || siswa.namaIbu || '________________'}</p>
          </div>
          <div>
            <p>{sekolah.kabupaten}, {tanggalSekarang()}</p>
            <p>Wali Kelas</p>
            <div className="h-16" />
            <p className="font-bold underline">{kelas.waliKelas || '________________'}</p>
            <p>{kelas.nipWali ? `NIP. ${kelas.nipWali}` : ''}</p>
          </div>
          <div>
            <p>Kepala Sekolah</p>
            <div className="h-16" />
            <p className="font-bold underline">{sekolah.kepalaSekolah || '________________'}</p>
            <p>{sekolah.nipKepsek ? `NIP. ${sekolah.nipKepsek}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="no-print mt-6">
        <Card className="flex items-start gap-3 border-l-4 border-l-emerald-500 p-4">
          <Badge tone="emerald">Tips</Badge>
          <p className="text-xs leading-relaxed text-slate-600">
            Gunakan menu <strong>Cetak / Simpan PDF</strong> — rapor akan dicetak dalam format A4 tanpa elemen aplikasi. Atur orientasi <em>Portrait</em> dan
            margin <em>Default</em> pada dialog cetak agar hasil rapi.
          </p>
        </Card>
      </div>
    </div>
  )
}
