import { deepClone } from '../store'

// Hapus semua siswa beserta data terkait (nilai, kehadiran, dll.)
export function hapusSemuaSiswa(state, siswa) {
  const ids = new Set(siswa.map((s) => s.id))

  const nilai = deepClone(state.nilai || {})
  for (const bySiswa of Object.values(nilai)) {
    for (const id of Object.keys(bySiswa)) if (ids.has(id)) delete bySiswa[id]
  }

  const deskripsi = deepClone(state.deskripsi || {})
  for (const bySiswa of Object.values(deskripsi)) {
    for (const id of Object.keys(bySiswa)) if (ids.has(id)) delete bySiswa[id]
  }

  const ekskul = deepClone(state.ekskul || []).map((e) => {
    const n = {}
    for (const [sid, v] of Object.entries(e.nilai || {})) if (!ids.has(sid)) n[sid] = v
    return { ...e, nilai: n }
  })

  const kokurikuler = deepClone(state.kokurikuler || []).map((k) => {
    const h = {}
    for (const [sid, v] of Object.entries(k.hasil || {})) if (!ids.has(sid)) h[sid] = v
    return { ...k, hasil: h }
  })

  const profilLulusan = {}
  for (const [sid, dims] of Object.entries(state.profilLulusan || {})) if (!ids.has(sid)) profilLulusan[sid] = dims

  const kehadiran = {}
  for (const [sid, k] of Object.entries(state.kehadiran || {})) if (!ids.has(sid)) kehadiran[sid] = k

  const catatanWali = {}
  for (const [sid, c] of Object.entries(state.catatanWali || {})) if (!ids.has(sid)) catatanWali[sid] = c

  return { nilai, deskripsi, ekskul, kokurikuler, profilLulusan, kehadiran, catatanWali }
}

// Hapus semua kelas beserta seluruh data turunannya
export function hapusSemuaKelas(state) {
  return {
    kelas: [],
    siswa: [],
    mapel: [],
    nilai: {},
    deskripsi: {},
    ekskul: deepClone(state.ekskul || []).map((e) => ({ ...e, nilai: {} })),
    kokurikuler: deepClone(state.kokurikuler || []).map((k) => ({ ...k, hasil: {} })),
    profilLulusan: {},
    kehadiran: {},
    catatanWali: {},
  }
}

// Hapus semua mapel beserta TP, nilai, dan deskripsi manual
export function hapusSemuaMapel() {
  return { mapel: [], nilai: {}, deskripsi: {} }
}

// Bersihkan semua kehadiran (atur ke nol)
export function bersihkanKehadiran() {
  return { kehadiran: {} }
}
