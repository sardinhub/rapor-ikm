export function predikat(nilai, sekolah) {
  if (nilai == null || Number.isNaN(Number(nilai))) return '-'
  const n = Number(nilai)
  const a = Number(sekolah?.batasA) || 90
  const b = Number(sekolah?.batasB) || 80
  const c = Number(sekolah?.batasC) || 70
  if (n >= a) return 'A'
  if (n >= b) return 'B'
  if (n >= c) return 'C'
  return 'D'
}

export function predikatKeterangan(p) {
  const map = {
    A: 'Sangat Baik',
    B: 'Baik',
    C: 'Cukup',
    D: 'Perlu Bimbingan',
  }
  return map[p] || '-'
}

// Deskripsi otomatis capaian kompetensi berdasarkan rata-rata nilai TP
export function deskripsiOtomatis(mapel, rataRata, sekolah) {
  const nama = mapel?.nama || 'mata pelajaran'
  const kkm = Number(mapel?.kkm) || Number(sekolah?.kkm) || 70
  const n = Number(rataRata)
  if (Number.isNaN(n)) return 'Belum ada data nilai.'
  const kunci =
    n >= kkm + 15
      ? 'sangat baik dan konsisten dalam menguasai seluruh tujuan pembelajaran'
      : n >= kkm + 5
        ? 'baik dalam menguasai tujuan pembelajaran'
        : n >= kkm
          ? 'cukup baik; capaian pembelajaran telah tercapai, namun perlu penguatan pada sebagian tujuan pembelajaran'
          : 'belum sepenuhnya mencapai tujuan pembelajaran; perlu pendampingan dan latihan lanjutan'
  return `Peserta didik menunjukkan capaian ${kunci} pada mata pelajaran ${nama}.`
}

export function rataRataNilai(tpNilai) {
  const vals = Object.values(tpNilai || {}).filter((v) => v != null && v !== '')
  if (vals.length === 0) return null
  return Math.round((vals.reduce((a, b) => a + Number(b), 0) / vals.length) * 10) / 10
}

export function persenKehadiran(s, hariEfektif) {
  const total = (s?.sakit || 0) + (s?.izin || 0) + (s?.alpha || 0)
  const hari = Number(hariEfektif) || 120
  const hadir = Math.max(hari - total, 0)
  return Math.round((hadir / hari) * 1000) / 10
}

export function formatTgl(iso) {
  if (!iso) return '-'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

export function tanggalSekarang() {
  const d = new Date()
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

export function uid() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
