// ============================================================
// API Peran & NPSN Pengguna Saat Ini (Vercel Serverless Function)
// Endpoint: /api/users/me
//   GET  → { id, email, nama, role, npsn }
//   POST → { npsn }  (mengikat NPSN sekolah ke akun)
//
// Memakai service role key sehingga TIDAK terpengaruh kebijakan
// RLS tabel users_meta. Aturan NPSN:
//   - Akun belum punya NPSN  → NPSN diisi (login pertama).
//   - NPSN cocok             → diterima.
//   - NPSN berbeda           → ditolak 409 (data sekolah lain
//     tidak boleh diakses lewat akun ini).
// ============================================================
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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

    // ---------- POST: ikat NPSN ke akun ----------
    if (req.method === 'POST') {
      const { npsn } = req.body || {}
      const npsnBaru = String(npsn || '').trim()
      if (!/^\d{8}$/.test(npsnBaru)) {
        return json(res, 400, { error: 'NPSN wajib diisi dan terdiri dari 8 digit angka.' })
      }
      if (meta?.npsn && meta.npsn !== npsnBaru) {
        return json(res, 409, {
          error: `Akun ini sudah terhubung ke sekolah dengan NPSN ${meta.npsn}. Gunakan NPSN tersebut, atau minta admin mengubah NPSN akun Anda.`,
        })
      }
      const { error: upErr } = await admin.from('users_meta').upsert(
        {
          id: user.id,
          email: user.email || '',
          nama: meta?.nama || user.user_metadata?.nama || user.email || '',
          role: meta?.role || 'guru',
          npsn: npsnBaru,
        },
        { onConflict: 'id' },
      )
      if (upErr) throw upErr
      return json(res, 200, {
        id: user.id,
        email: user.email,
        nama: meta?.nama || user.user_metadata?.nama || user.email || '',
        role: meta?.role || 'guru',
        npsn: npsnBaru,
      })
    }

    // ---------- GET: kembalikan role & npsn ----------
    // Bootstrap: baris users_meta dibuat otomatis jika belum ada
    // (role: admin untuk pengguna pertama, tanpa NPSN sampai
    // pengguna login dengan NPSN sekolahnya).
    if (!meta) {
      const { count, error: countErr } = await admin
        .from('users_meta')
        .select('id', { count: 'exact', head: true })
      if (countErr) throw countErr
      const role = Number(count) === 0 ? 'admin' : 'guru'
      const nama = user.user_metadata?.nama || user.email || ''
      const { error: upsertErr } = await admin.from('users_meta').upsert(
        { id: user.id, email: user.email || '', nama, role, npsn: null },
        { onConflict: 'id' },
      )
      if (upsertErr) throw upsertErr
      return json(res, 200, { id: user.id, email: user.email, nama, role, npsn: null })
    }

    return json(res, 200, { id: user.id, email: user.email, nama: meta.nama, role: meta.role, npsn: meta.npsn || null })
  } catch (e) {
    console.error('API /api/users/me error:', e)
    return json(res, 500, { error: e.message || 'Terjadi kesalahan server.' })
  }
}
