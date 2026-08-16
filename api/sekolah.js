// ============================================================
// API Registrasi Sekolah (Vercel Serverless Function)
// Endpoint: /api/sekolah
// Hanya SUPER ADMIN (peran 'superadmin' di users_meta) yang dapat
// mengakses. Memakai service role key — tidak pernah bocor ke klien.
// ============================================================
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body))
}

async function requireSuperAdmin(req, res) {
  if (!URL || !SERVICE_ROLE) {
    json(res, 500, { error: 'Supabase service role belum dikonfigurasi di server.' })
    return null
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) {
    json(res, 401, { error: 'Tidak ada token autentikasi.' })
    return null
  }
  const admin = createClient(URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) {
    json(res, 401, { error: 'Sesi tidak valid.' })
    return null
  }
  const { data: meta } = await admin.from('users_meta').select('role').eq('id', data.user.id).single()
  if (meta?.role !== 'superadmin') {
    json(res, 403, { error: 'Hanya super admin pemilik aplikasi yang dapat mengelola registrasi sekolah.' })
    return null
  }
  return { admin, userId: data.user.id }
}

export default async function handler(req, res) {
  const ctx = await requireSuperAdmin(req, res)
  if (!ctx) return
  const { admin, userId } = ctx

  try {
    if (req.method === 'GET') {
      const { data, error } = await admin.from('sekolah_daftar').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return json(res, 200, data || [])
    }

    if (req.method === 'POST') {
      const { npsn, nama, jenjang, alamat, kabupaten, provinsi, status, keterangan } = req.body || {}
      const npsnBersih = String(npsn || '').trim()
      if (!/^\d{8}$/.test(npsnBersih)) return json(res, 400, { error: 'NPSN wajib 8 digit angka.' })
      if (!nama || !String(nama).trim()) return json(res, 400, { error: 'Nama sekolah wajib diisi.' })

      const { data: sudah } = await admin.from('sekolah_daftar').select('npsn').eq('npsn', npsnBersih).maybeSingle()
      if (sudah) return json(res, 409, { error: `Sekolah dengan NPSN ${npsnBersih} sudah terdaftar.` })

      const { data, error } = await admin
        .from('sekolah_daftar')
        .insert({
          npsn: npsnBersih,
          nama: String(nama).trim(),
          jenjang: jenjang || '',
          alamat: alamat || '',
          kabupaten: kabupaten || '',
          provinsi: provinsi || '',
          status: status === 'nonaktif' ? 'nonaktif' : 'aktif',
          keterangan: keterangan || '',
          created_by: userId,
        })
        .select()
        .single()
      if (error) throw error
      return json(res, 201, data)
    }

    if (req.method === 'PATCH') {
      const { npsn, nama, jenjang, alamat, kabupaten, provinsi, status, keterangan } = req.body || {}
      if (!npsn) return json(res, 400, { error: 'NPSN wajib diisi.' })

      const upd = {}
      if (nama !== undefined) upd.nama = String(nama).trim()
      if (jenjang !== undefined) upd.jenjang = jenjang
      if (alamat !== undefined) upd.alamat = alamat
      if (kabupaten !== undefined) upd.kabupaten = kabupaten
      if (provinsi !== undefined) upd.provinsi = provinsi
      if (keterangan !== undefined) upd.keterangan = keterangan
      if (status !== undefined) {
        if (!['aktif', 'nonaktif'].includes(status)) return json(res, 400, { error: 'Status harus aktif atau nonaktif.' })
        upd.status = status
      }
      if (!Object.keys(upd).length) return json(res, 400, { error: 'Tidak ada data yang diubah.' })

      const { data, error } = await admin.from('sekolah_daftar').update(upd).eq('npsn', npsn).select().single()
      if (error) throw error
      return json(res, 200, data)
    }

    if (req.method === 'DELETE') {
      const { npsn } = req.body || {}
      if (!npsn) return json(res, 400, { error: 'NPSN wajib diisi.' })
      const { error } = await admin.from('sekolah_daftar').delete().eq('npsn', npsn)
      if (error) throw error
      return json(res, 200, { ok: true })
    }

    return json(res, 405, { error: 'Metode tidak didukung.' })
  } catch (e) {
    console.error('API /api/sekolah error:', e)
    return json(res, 500, { error: e.message || 'Terjadi kesalahan server.' })
  }
}
