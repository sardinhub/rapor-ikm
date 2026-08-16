// ============================================================
// API Cek Peran Pengguna Saat Ini (Vercel Serverless Function)
// Endpoint: /api/users/me  (GET)
//
// Mengembalikan peran (role) pengguna yang sedang login:
//   { id, email, nama, role }
//
// Memakai service role key sehingga TIDAK terpengaruh kebijakan
// RLS tabel users_meta (mis. recursive policy) — role selalu
// terbaca selama JWT pengguna valid.
// ============================================================
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Metode tidak didukung.' })
  }
  if (!URL || !SERVICE_ROLE) {
    return json(res, 500, { error: 'Supabase service role belum dikonfigurasi di server.' })
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) {
    return json(res, 401, { error: 'Tidak ada token autentikasi.' })
  }

  const admin = createClient(URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data?.user) {
      return json(res, 401, { error: 'Sesi tidak valid.' })
    }
    const user = data.user

    const { data: meta, error: metaErr } = await admin
      .from('users_meta')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    if (metaErr) throw metaErr

    let role = meta?.role
    if (!meta) {
      // Bootstrap: pengguna pertama yang masuk otomatis menjadi admin
      const { count, error: countErr } = await admin
        .from('users_meta')
        .select('id', { count: 'exact', head: true })
      if (countErr) throw countErr
      role = Number(count) === 0 ? 'admin' : 'guru'
      const nama = user.user_metadata?.nama || user.email || ''
      const { error: upsertErr } = await admin.from('users_meta').upsert(
        { id: user.id, email: user.email || '', nama, role },
        { onConflict: 'id' },
      )
      if (upsertErr) throw upsertErr
      return json(res, 200, { id: user.id, email: user.email, nama, role })
    }

    return json(res, 200, { id: user.id, email: user.email, nama: meta.nama, role })
  } catch (e) {
    console.error('API /api/users/me error:', e)
    return json(res, 500, { error: e.message || 'Terjadi kesalahan server.' })
  }
}
