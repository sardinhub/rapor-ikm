-- ============================================================
-- Migrasi 0006: PERBAIKAN kolom id pada tabel sekolah
-- Jalankan di Supabase Dashboard → SQL Editor
--
-- Sejak multi-sekolah, baris tabel `sekolah` dikunci oleh NPSN
-- (PK = npsn) dan aplikasi tidak lagi mengirim kolom `id`.
-- Namun kolom `id` lama masih NOT NULL → semua penulisan data
-- sekolah gagal ("null value in column id"). Solusi: hapus kolom
-- yang sudah tidak dipakai.
-- ============================================================

alter table public.sekolah drop column if exists id;
