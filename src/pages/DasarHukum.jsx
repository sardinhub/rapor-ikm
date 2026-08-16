import { Scale, BookOpenCheck, FileText } from 'lucide-react'
import { Card, Badge, PageHeader } from '../components/ui'
import { REGULASI, KETERANGAN_KURIKULUM } from '../data/regulasi'

export default function DasarHukum() {
  return (
    <div>
      <PageHeader
        title="Dasar Hukum"
        subtitle="Regulasi Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen) yang menjadi acuan struktur, penilaian, dan pelaporan pada aplikasi Rapor IKM ini."
      />

      <Card className="mb-6 border-l-4 border-l-emerald-500 p-5">
        <div className="flex items-start gap-3">
          <BookOpenCheck className="mt-0.5 text-emerald-600" size={22} />
          <div>
            <h2 className="text-sm font-bold text-slate-900">{KETERANGAN_KURIKULUM.judul}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{KETERANGAN_KURIKULUM.deskripsi}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {REGULASI.map((r, i) => (
          <Card key={r.nomor} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                {i < 3 ? <Scale size={17} /> : <FileText size={17} />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{r.judul}</h3>
                  <Badge tone="emerald">{r.nomor}</Badge>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  <strong className="text-slate-700">Keterkaitan dengan aplikasi:</strong> {r.kaitan}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-l-4 border-l-amber-500 p-5">
        <h3 className="text-sm font-bold text-slate-900">Catatan Penting</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            Permendikdasmen No. 13 Tahun 2025 <em>bukan kurikulum baru</em> — Kurikulum 2013 dan Kurikulum Merdeka tetap berlaku. Aplikasi ini mendukung Kurikulum Merdeka dengan pendekatan pembelajaran mendalam.
          </li>
          <li>
            Bagian <strong>Profil Lulusan</strong> pada rapor memuat 8 dimensi sesuai Permendikdasmen No. 10 Tahun 2025 (penyempurnaan dimensi Profil Pelajar Pancasila).
          </li>
          <li>
            <strong>Koding dan Kecerdasan Artifisial</strong> tersedia sebagai mata pelajaran pilihan (mulai kelas 5, 7, dan 10 pada TA 2025/2026 secara bertahap).
          </li>
          <li>
            Satuan pendidikan <strong>wajib menyediakan</strong> ekstrakurikuler berbasis kepanduan (kepramukaan) — pada aplikasi ditandai otomatis.
          </li>
          <li>
            Ambang batas predikat (A/B/C/D) dapat disesuaikan sekolah melalui menu Profil Sekolah sesuai kebijakan satuan pendidikan.
          </li>
        </ul>
      </Card>
    </div>
  )
}
