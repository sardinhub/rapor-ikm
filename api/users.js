// ============================================================
// API Admin Pengguna (Vercel Serverless Function)
// Endpoint: /api/users
// Hanya admin (peran 'admin' di tabel users_meta) yang dapat
// mengakses. Menggunakan service role key — JANGAN pernah
// dibocorkan ke klien; cukup disimpan sebagai environment
// variable di Vercel: SUPABASE_SERVICE_ROLE_KEY
// ============================================================
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

function adminClient() {
  return createClient(URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body))
}

async function requireAdmin(req, res) {
  if (!URL || !SERVICE_ROLE) {
    json(res, 500, { error: 'Supabase service role belum dikonfigurasi di server.' })
    return null
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) {
    json(res, 401, { error: 'Tidak ada token autentikasi.' })
    return null
  }
  const admin = adminClient()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) {
    json(res, 401, { error: 'Sesi tidak valid.' })
    return null
  }
  const { data: meta } = await admin.from('users_meta').select('role').eq('id', data.user.id).single()
  if (!['admin', 'superadmin'].includes(meta?.role)) {
    json(res, 403, { error: 'Hanya admin yang dapat mengelola pengguna.' })
    return null
  }
  return { admin, userId: data.user.id }
}

async function listUsers(admin) {
  const { data: users, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw error
  const { data: metas } = await admin.from('users_meta').select('*')
  const metaMap = Object.fromEntries((metas || []).map((m) => [m.id, m]))
  return (users.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at,
    role: metaMap[u.id]?.role || 'guru',
    nama: metaMap[u.id]?.nama || u.email,
    npsn: metaMap[u.id]?.npsn || '',
  }))
}

export default async function handler(req, res) {
  const ctx = await requireAdmin(req, res)
  if (!ctx) return
  const { admin, userId } = ctx

  try {
    if (req.method === 'GET') {
      return json(res, 200, await listUsers(admin))
    }

    if (req.method === 'POST') {
      const { email, password, nama, role = 'guru', npsn = '' } = req.body || {}
      if (!email || !password) return json(res, 400, { error: 'Email dan password wajib diisi.' })
      if (password.length < 6) return json(res, 400, { error: 'Password minimal 6 karakter.' })
      if (npsn && !/^\d{8}$/.test(npsn)) return json(res, 400, { error: 'NPSN harus 8 digit angka.' })

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama, role },
      })
      if (createErr) return json(res, 400, { error: createErr.message })

      const { error: metaErr } = await admin.from('users_meta').upsert(
        { id: created.user.id, email, nama: nama || email, role, npsn: npsn || null },
        { onConflict: 'id' },
      )
      if (metaErr) throw metaErr
      return json(res, 201, { user: { id: created.user.id, email, nama: nama || email, role, npsn: npsn || null } })
    }

    if (req.method === 'PATCH') {
      const { id, nama, role, npsn } = req.body || {}
      if (!id) return json(res, 400, { error: 'ID pengguna wajib diisi.' })
      if (npsn !== undefined && npsn !== '' && !/^\d{8}$/.test(npsn)) {
        return json(res, 400, { error: 'NPSN harus 8 digit angka.' })
      }

      const upd = {}
      if (role) upd.role = role
      if (nama !== undefined) upd.nama = nama
      if (npsn !== undefined) upd.npsn = npsn || null
      if (Object.keys(upd).length) {
        const { error: metaErr } = await admin.from('users_meta').update(upd).eq('id', id)
        if (metaErr) throw metaErr
      }
      return json(res, 200, { ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return json(res, 400, { error: 'ID pengguna wajib diisi.' })
      if (id === userId) {
        return json(res, 400, { error: 'Tidak dapat menghapus akun sendiri.' })
      }
      const { error: delErr } = await admin.auth.admin.deleteUser(id)
      if (delErr) throw delErr
      await admin.from('users_meta').delete().eq('id', id)
      return json(res, 200, { ok: true })
    }

    return json(res, 405, { error: 'Metode tidak didukung.' })
  } catch (e) {
    console.error('API /api/users error:', e)
    return json(res, 500, { error: e.message || 'Terjadi kesalahan server.' })
  }
}
