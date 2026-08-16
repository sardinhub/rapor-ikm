import { supabase } from '../lib/supabase'
import { DIMENSI } from '../data/seed'

// ============================================================
// Pemetaan state aplikasi ↔ tabel database (Supabase)
// State adalah sumber kebenaran; setiap perubahan di-push
// (debounce) sebagai full-replace per tabel.
// ============================================================

const TABLES = [
  'sekolah',
  'kelas',
  'siswa',
  'mapel',
  'tp',
  'nilai',
  'deskripsi',
  'kokurikuler',
  'kokurikuler_hasil',
  'ekskul',
  'ekskul_nilai',
  'kehadiran',
  'catatan_wali',
  'profil_lulusan',
]

// ---------- Konversi state → baris DB (snake_case) ----------

const toSekolahRow = (s) => ({
  id: 1,
  npsn: s.npsn,
  nss: s.nss,
  nama: s.nama,
  alamat: s.alamat,
  desa: s.desa,
  kecamatan: s.kecamatan,
  kabupaten: s.kabupaten,
  provinsi: s.provinsi,
  kode_pos: s.kodePos,
  telp: s.telp,
  email: s.email,
  website: s.website,
  akreditasi: s.akreditasi,
  jenjang: s.jenjang,
  kurikulum: s.kurikulum,
  tahun_pelajaran: s.tahunPelajaran,
  semester: s.semester,
  hari_efektif: s.hariEfektif,
  kepala_sekolah: s.kepalaSekolah,
  nip_kepsek: s.nipKepsek,
  batas_a: s.batasA,
  batas_b: s.batasB,
  batas_c: s.batasC,
})

const toKelasRow = (k) => ({ id: k.id, nama: k.nama, fase: k.fase, wali_kelas: k.waliKelas, nip_wali: k.nipWali })

const toSiswaRow = (s) => ({
  id: s.id,
  kelas_id: s.kelasId,
  nisn: s.nisn,
  nis: s.nis,
  nama: s.nama,
  tempat_lahir: s.tempatLahir,
  tgl_lahir: s.tglLahir,
  jenis_kelamin: s.jenisKelamin,
  agama: s.agama,
  alamat: s.alamat,
  nama_ayah: s.namaAyah,
  nama_ibu: s.namaIbu,
  pekerjaan_ayah: s.pekerjaanAyah,
  pekerjaan_ibu: s.pekerjaanIbu,
})

const toMapelRow = (m) => ({
  id: m.id,
  kelas_id: m.kelasId,
  kode: m.kode,
  nama: m.nama,
  kkm: m.kkm,
  pilihan: !!m.pilihan,
  keterangan: m.keterangan || '',
  guru: m.guru,
})

const toTpRow = (m, t) => ({ id: t.id, mapel_id: m.id, kode: t.kode, deskripsi: t.deskripsi })

const toKokRow = (k) => ({ id: k.id, nama: k.nama, jenis: k.jenis, deskripsi: k.deskripsi })

const toEkskulRow = (e) => ({ id: e.id, nama: e.nama, pembina: e.pembina, wajib: !!e.wajib, keterangan: e.keterangan })

// ---------- Konversi baris DB → state (camelCase) ----------

const fromSekolahRow = (r) => ({
  npsn: r.npsn || '',
  nss: r.nss || '',
  nama: r.nama || '',
  alamat: r.alamat || '',
  desa: r.desa || '',
  kecamatan: r.kecamatan || '',
  kabupaten: r.kabupaten || '',
  provinsi: r.provinsi || '',
  kodePos: r.kode_pos || '',
  telp: r.telp || '',
  email: r.email || '',
  website: r.website || '',
  akreditasi: r.akreditasi || '',
  jenjang: r.jenjang || '',
  kurikulum: r.kurikulum || '',
  tahunPelajaran: r.tahun_pelajaran || '',
  semester: r.semester ?? 1,
  hariEfektif: r.hari_efektif ?? 120,
  kepalaSekolah: r.kepala_sekolah || '',
  nipKepsek: r.nip_kepsek || '',
  batasA: r.batas_a ?? 90,
  batasB: r.batas_b ?? 80,
  batasC: r.batas_c ?? 70,
})

const fromKelasRow = (r) => ({ id: r.id, nama: r.nama, fase: r.fase || 'D', waliKelas: r.wali_kelas || '', nipWali: r.nip_wali || '' })

const fromSiswaRow = (r) => ({
  id: r.id,
  kelasId: r.kelas_id,
  nisn: r.nisn || '',
  nis: r.nis || '',
  nama: r.nama,
  tempatLahir: r.tempat_lahir || '',
  tglLahir: r.tgl_lahir || '',
  jenisKelamin: r.jenis_kelamin || 'L',
  agama: r.agama || '',
  alamat: r.alamat || '',
  namaAyah: r.nama_ayah || '',
  namaIbu: r.nama_ibu || '',
  pekerjaanAyah: r.pekerjaan_ayah || '',
  pekerjaanIbu: r.pekerjaan_ibu || '',
})

const fromMapelRow = (r) => ({
  id: r.id,
  kelasId: r.kelas_id,
  kode: r.kode || '',
  nama: r.nama,
  kkm: r.kkm ?? 70,
  pilihan: !!r.pilihan,
  keterangan: r.keterangan || '',
  guru: r.guru || '',
})

const fromTpRow = (r) => ({ id: r.id, kode: r.kode || '', deskripsi: r.deskripsi || '' })

const fromKokRow = (r) => ({ id: r.id, nama: r.nama, jenis: r.jenis || 'Projek Kokurikuler', deskripsi: r.deskripsi || '' })

const fromEkskulRow = (r) => ({ id: r.id, nama: r.nama, pembina: r.pembina || '', wajib: !!r.wajib, keterangan: r.keterangan || '' })

function groupBy(rows, key) {
  const out = {}
  for (const r of rows) {
    ;(out[r[key]] = out[r[key]] || []).push(r)
  }
  return out
}

// ---------- Hydrate: database → state ----------

export async function hydrateFromDb() {
  if (!supabase) return null
  const results = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')))
  for (const r of results) {
    if (r.error) throw new Error(r.error.message)
  }
  const [
    sekolahRows,
    kelasRows,
    siswaRows,
    mapelRows,
    tpRows,
    nilaiRows,
    deskripsiRows,
    kokRows,
    kokHasilRows,
    ekskulRows,
    ekskulNilaiRows,
    kehadiranRows,
    catatanRows,
    profilRows,
  ] = results.map((r) => r.data)

  // Database masih kosong → biarkan aplikasi memakai data lokal & mengisinya
  if (!sekolahRows.length && !kelasRows.length && !siswaRows.length) return null

  const tpByMapel = groupBy(tpRows, 'mapel_id')

  const nilai = {}
  for (const n of nilaiRows) {
    nilai[n.mapel_id] = nilai[n.mapel_id] || {}
    nilai[n.mapel_id][n.siswa_id] = nilai[n.mapel_id][n.siswa_id] || {}
    nilai[n.mapel_id][n.siswa_id][n.tp_id] = Number(n.nilai)
  }

  const deskripsi = {}
  for (const d of deskripsiRows) {
    deskripsi[d.mapel_id] = deskripsi[d.mapel_id] || {}
    deskripsi[d.mapel_id][d.siswa_id] = d.deskripsi
  }

  const profilLulusan = {}
  for (const p of profilRows) {
    profilLulusan[p.siswa_id] = profilLulusan[p.siswa_id] || {}
    profilLulusan[p.siswa_id][p.dimensi_id] = p.deskripsi
  }

  const kokurikuler = kokRows.map((k) => ({
    ...fromKokRow(k),
    hasil: Object.fromEntries(
      kokHasilRows.filter((h) => h.kokurikuler_id === k.id).map((h) => [h.siswa_id, h.hasil]),
    ),
  }))

  const ekskul = ekskulRows.map((e) => ({
    ...fromEkskulRow(e),
    nilai: Object.fromEntries(
      ekskulNilaiRows
        .filter((n) => n.ekskul_id === e.id)
        .map((n) => [n.siswa_id, { nilai: n.nilai, deskripsi: n.deskripsi || '' }]),
    ),
  }))

  const kehadiran = {}
  for (const k of kehadiranRows) {
    kehadiran[k.siswa_id] = { sakit: k.sakit ?? 0, izin: k.izin ?? 0, alpha: k.alpha ?? 0 }
  }

  const catatanWali = {}
  for (const c of catatanRows) catatanWali[c.siswa_id] = c.catatan

  return {
    sekolah: fromSekolahRow(sekolahRows[0] || {}),
    kelas: kelasRows.map(fromKelasRow),
    siswa: siswaRows.map(fromSiswaRow),
    mapel: mapelRows.map((m) => ({ ...fromMapelRow(m), tp: (tpByMapel[m.id] || []).map(fromTpRow) })),
    nilai,
    dimensi: DIMENSI,
    profilLulusan,
    kokurikuler,
    ekskul,
    kehadiran,
    catatanWali,
    deskripsi,
  }
}

// ---------- Push: state → database ----------

async function replaceTable(table, rows, idCol = 'id') {
  const ids = rows.map((r) => r[idCol])
  const { error: delErr } = await supabase.from(table).delete().neq(idCol, idCol) // hapus semua baris
  if (delErr) throw new Error(`Gagal membersihkan ${table}: ${delErr.message}`)
  if (ids.length) {
    const { error: upErr } = await supabase.from(table).upsert(rows)
    if (upErr) throw new Error(`Gagal menyimpan ${table}: ${upErr.message}`)
  }
}

const PUSHERS = {
  // `sekolah` adalah baris tunggal (id = 1) → cukup upsert, tanpa hapus
  // (kolom id bertipe integer, trik hapus `.neq('id','id')` tidak valid).
  sekolah: async (state) => {
    const { error } = await supabase.from('sekolah').upsert(toSekolahRow(state.sekolah))
    if (error) throw new Error(`Gagal menyimpan sekolah: ${error.message}`)
  },
  kelas: (state) => replaceTable('kelas', state.kelas.map(toKelasRow)),
  siswa: (state) => replaceTable('siswa', state.siswa.map(toSiswaRow)),
  mapel: async (state) => {
    await replaceTable('mapel', state.mapel.map(toMapelRow))
    const tpRows = state.mapel.flatMap((m) => m.tp.map((t) => toTpRow(m, t)))
    await replaceTable('tp', tpRows)
  },
  nilai: (state) => {
    const rows = []
    for (const [mapelId, bySiswa] of Object.entries(state.nilai || {})) {
      for (const [siswaId, byTp] of Object.entries(bySiswa)) {
        for (const [tpId, v] of Object.entries(byTp)) {
          if (v == null || v === '') continue
          rows.push({ id: `${mapelId}:${siswaId}:${tpId}`, mapel_id: mapelId, siswa_id: siswaId, tp_id: tpId, nilai: Number(v) })
        }
      }
    }
    return replaceTable('nilai', rows)
  },
  deskripsi: (state) => {
    const rows = []
    for (const [mapelId, bySiswa] of Object.entries(state.deskripsi || {})) {
      for (const [siswaId, d] of Object.entries(bySiswa)) {
        if (!d) continue
        rows.push({ id: `${mapelId}:${siswaId}`, mapel_id: mapelId, siswa_id: siswaId, deskripsi: d })
      }
    }
    return replaceTable('deskripsi', rows)
  },
  kokurikuler: async (state) => {
    await replaceTable('kokurikuler', state.kokurikuler.map(toKokRow))
    const rows = []
    for (const k of state.kokurikuler) {
      for (const [siswaId, hasil] of Object.entries(k.hasil || {})) {
        if (!hasil) continue
        rows.push({ id: `${k.id}:${siswaId}`, kokurikuler_id: k.id, siswa_id: siswaId, hasil })
      }
    }
    await replaceTable('kokurikuler_hasil', rows)
  },
  ekskul: async (state) => {
    await replaceTable('ekskul', state.ekskul.map(toEkskulRow))
    const rows = []
    for (const e of state.ekskul) {
      for (const [siswaId, v] of Object.entries(e.nilai || {})) {
        rows.push({
          id: `${e.id}:${siswaId}`,
          ekskul_id: e.id,
          siswa_id: siswaId,
          nilai: v.nilai ?? null,
          deskripsi: v.deskripsi || '',
        })
      }
    }
    await replaceTable('ekskul_nilai', rows)
  },
  kehadiran: (state) =>
    replaceTable(
      'kehadiran',
      Object.entries(state.kehadiran || {}).map(([siswaId, k]) => ({
        id: siswaId,
        siswa_id: siswaId,
        sakit: k.sakit ?? 0,
        izin: k.izin ?? 0,
        alpha: k.alpha ?? 0,
      })),
    ),
  catatanWali: (state) =>
    replaceTable(
      'catatan_wali',
      Object.entries(state.catatanWali || {}).map(([siswaId, catatan]) => ({ id: siswaId, siswa_id: siswaId, catatan })),
    ),
  profilLulusan: (state) => {
    const rows = []
    for (const [siswaId, dims] of Object.entries(state.profilLulusan || {})) {
      for (const [dimensiId, d] of Object.entries(dims)) {
        rows.push({ id: `${siswaId}:${dimensiId}`, siswa_id: siswaId, dimensi_id: dimensiId, deskripsi: d })
      }
    }
    return replaceTable('profil_lulusan', rows)
  },
}

export async function pushKeys(state, keys) {
  for (const k of keys) {
    const fn = PUSHERS[k]
    if (fn) await fn(state)
  }
}
