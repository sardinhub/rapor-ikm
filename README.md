# Rapor IKM — Rapor Kurikulum Merdeka

> **🌐 Live:** [rapor-ikm.vercel.app](https://rapor-ikm.vercel.app) · **Repo:** [github.com/sardinhub/rapor-ikm](https://github.com/sardinhub/rapor-ikm)
> **⚡ Auto-deploy:** setiap push ke `main` langsung di-deploy ke produksi oleh Vercel (GitHub Integration).

Aplikasi web pengelolaan **Rapor Kurikulum Merdeka** (Implementasi Kurikulum Merdeka / IKM) yang disusun mengikuti peraturan **Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen)** terbaru.

- **Online**: terintegrasi **Supabase** (PostgreSQL + Auth) — data tersinkron ke database dan bisa diakses dari mana saja setelah login.
- **Offline-friendly**: bila database tidak dikonfigurasi atau koneksi terputus, aplikasi tetap berjalan dengan penyimpanan lokal (localStorage).
- **Cetak A4**: rapor dapat dicetak / disimpan sebagai PDF.

## Fitur

| Modul | Keterangan |
| --- | --- |
| **Dashboard** | Ringkasan kelas, peserta didik, mata pelajaran, status pengisian nilai, ekspor/impor/reset data |
| **Profil Sekolah** | Identitas satuan pendidikan (NPSN, NSS, alamat), kepala sekolah, tahun pelajaran & semester, ambang predikat A/B/C/D |
| **Kelas & Siswa** | CRUD rombongan belajar (rombel) & data peserta didik (NISN, NIS, orang tua/wali) |
| **Mata Pelajaran & Nilai** | CP diurai menjadi Tujuan Pembelajaran (TP), input nilai asesmen sumatif per TP, nilai akhir & predikat otomatis, deskripsi capaian otomatis + manual |
| **Profil Lulusan** | 8 dimensi Profil Lulusan sesuai **Permendikdasmen No. 10 Tahun 2025** |
| **Kokurikuler** | Kegiatan kokurikuler fleksibel (termasuk **Gerakan 7 Kebiasaan Anak Indonesia Hebat**) sesuai **Permendikdasmen No. 13 Tahun 2025** |
| **Ekstrakurikuler** | CRUD ekskul; **kepramukaan/kepanduan wajib disediakan** (Permendikdasmen No. 13 Tahun 2025) |
| **Kehadiran** | Rekap Sakit/Izin/Alpha + persentase kehadiran |
| **Rapor & Cetak** | Pratinjau rapor format e-Rapor Kurikulum Merdeka (A4) siap cetak/simpan PDF |
| **Dasar Hukum** | Daftar regulasi yang menjadi acuan aplikasi |
| **Login** | Autentikasi pengguna via Supabase Auth (email + password) |
| **Admin — Pengguna & Hak Akses** | Kelola akun (tambah/hapus) dan hak akses (admin/guru) via serverless API |
| **Hapus Data per Menu** | Tombol hapus semua data pada tiap menu (siswa, mapel, kokurikuler, ekskul, kehadiran, catatan, profil lulusan) |
| **Mulai dari Nol** | Kosongkan seluruh data (database + perangkat) sekali klik dari Dashboard |

## 🏫 Multi-sekolah (per NPSN)

Aplikasi dapat dipakai oleh **banyak sekolah sekaligus**. Setiap login **wajib memasukkan NPSN** (8 digit):

- Seluruh data rapor (kelas, siswa, mapel, nilai, kehadiran, dll.) dikunci kolom `npsn`.
- **RLS database** menjamin pengguna hanya melihat/menulis data sekolahnya — data sekolah lain tidak pernah tampil, bahkan lewat API.
- NPSN pertama yang diisi terkunci pada akun (NPSN berbeda ditolak). Admin dapat mengubah NPSN akun lewat **Admin — Pengguna & Akses**.
- Sekolah baru dimulai **kosong** (tanpa data contoh) dan cache lokal dipisah per NPSN.

### Migrasi wajib (dari versi sebelumnya)

Jalankan **seluruh isi** `supabase/migrations/0004_multi_tenant.sql` di **Supabase Dashboard → SQL Editor → Run**:
menambahkan kolom `npsn` ke semua tabel, mengubah kunci utama menjadi komposit `(id, npsn)`, dan mengaktifkan RLS per NPSN.
Data lama otomatis dianggap milik sekolah contoh `20328901`.

## Arsitektur Data

State aplikasi disinkronkan dengan tabel-tabel PostgreSQL di Supabase:

```
sekolah, kelas, siswa, mapel, tp, nilai, deskripsi,
kokurikuler, kokurikuler_hasil, ekskul, ekskul_nilai,
kehadiran, catatan_wali, profil_lulusan
```

- **Hydrate**: saat aplikasi dimuat, seluruh data dimuat dari database.
- **Write-through**: setiap perubahan di-push otomatis (debounce 800 ms) per tabel yang berubah.
- **RLS**: hanya pengguna yang login (`authenticated`) yang dapat membaca & menulis data.

## Setup Database (Supabase)

1. Buat proyek di [supabase.com](https://supabase.com) (free tier cukup).
2. Buka **SQL Editor** → tempel isi `supabase/schema.sql` → **Run** (membuat tabel + kebijakan RLS).
3. Jika proyek sudah pernah dibuat dengan skema lama, jalankan juga `supabase/migrations/0002_users_meta.sql` (hak akses), `0004_multi_tenant.sql` (multi-sekolah), `0005_sekolah_daftar.sql` (registrasi sekolah) dan `0006_fix_sekolah_id.sql` (perbaikan kolom id).
4. Salin kredensial: **Project Settings → API** → *Project URL* dan *anon public key*.
5. Isi file `.env.local`:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

6. Mulai ulang `npm run dev`. Aplikasi akan menampilkan halaman **Masuk/Daftar**.
   - Login **wajib menyertakan NPSN sekolah** (8 digit) — data yang tampil hanya milik sekolah dengan NPSN tersebut.
   - Buat akun pertama melalui tab **Daftar** (atau **Authentication → Users → Add user** di dashboard).
   - **Pengguna pertama otomatis menjadi admin** (bootstrap).
   - Sekolah baru dimulai kosong; data diinput manual.

> **Keamanan**: secara bawaan, siapa pun bisa mendaftar akun (anon key publik). Untuk produksi, nonaktifkan *Sign ups* di **Supabase → Authentication → Sign In / Up → Allow new users to sign up** — akun baru cukup dibuat lewat menu Admin aplikasi.

## Deployment ke Vercel

### Cara 1 — Import dari GitHub (disarankan)

1. Push proyek ini ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo → Vercel mendeteksi **Vite** secara otomatis (build `npm run build`, output `dist`).
3. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy**. Selesai — aplikasi online.

### Cara 2 — CLI Vercel

```bash
npm i -g vercel
vercel login
vercel --prod --yes   # konfigurasi & deploy pertama
# Tambahkan environment variables:
echo "https://xxxx.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOi..." | vercel env add VITE_SUPABASE_ANON_KEY production
# Service role (server-only) untuk API Admin — dari Project Settings → API → service_role:
echo "eyJhbGciOi...service..." | vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod --yes   # deploy ulang dengan env vars
```

> `api/users.js` adalah serverless function (kelola pengguna & hak akses). Function membaca `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — service role key **tidak pernah** diakses dari browser.

## Regulasi yang Dipatuhi

- **UU No. 20 Tahun 2003** — Sistem Pendidikan Nasional
- **PP No. 57 Tahun 2021 jo. PP No. 4 Tahun 2022** — Standar Nasional Pendidikan
- **Permendikbudristek No. 12 Tahun 2024** — Kurikulum Merdeka sebagai kurikulum nasional
- **Permendikdasmen No. 10 Tahun 2025** — Standar Kompetensi Lulusan (8 dimensi Profil Lulusan)
- **Permendikdasmen No. 12 Tahun 2025** — Standar Isi
- **Permendikdasmen No. 13 Tahun 2025** — Perubahan kurikulum: pembelajaran mendalam, Koding & AI mapel pilihan (kelas 5/7/10), kokurikuler fleksibel, kepanduan wajib
- **Permendikbudristek No. 21 Tahun 2022** — Standar Penilaian Pendidikan
- **Keputusan Kepala BSKAP** — Capaian Pembelajaran & Panduan Pembelajaran dan Asesmen
- **Gerakan 7 Kebiasaan Anak Indonesia Hebat**

## Struktur Proyek

```
src/
├── App.jsx              # Layout, guard autentikasi, indikator koneksi, menu Admin
├── auth.jsx             # Session Supabase Auth + peran (admin/guru)
├── store.jsx            # State global + hydrate & sinkronisasi ke DB
├── lib/supabase.js      # Klien Supabase (env VITE_SUPABASE_*)
├── lib/cleanup.js       # Helper hapus data per menu
├── db/sync.js           # Pemetaan state ↔ tabel DB (hydrate & push)
├── data/                # Seed & daftar dasar hukum
├── components/ui.jsx    # Komponen UI dasar
└── pages/               # Halaman per modul (termasuk Login & Admin)
api/users.js             # Serverless function: kelola pengguna & hak akses
supabase/schema.sql      # Skema database + RLS
supabase/migrations/     # Migrasi tambahan (users_meta)
```

## Catatan

- Sekolah baru dimulai kosong; gunakan **Mulai dari Nol** di Dashboard untuk mengosongkan seluruh data sekolah ini.
- Ambang predikat (A ≥ 90, B ≥ 80, C ≥ 70) dapat disesuaikan di **Profil Sekolah**.
- Gunakan **Ekspor/Impor Data** di Dashboard untuk cadangan (format JSON).
- Jangan pernah memasukkan kredensial Supabase **service_role** ke `.env.local` atau Vercel — cukup gunakan anon key.
