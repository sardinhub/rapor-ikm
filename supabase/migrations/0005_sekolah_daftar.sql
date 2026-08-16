-- ============================================================
-- Migrasi 0005: REGISTRASI SEKOLAH (super admin)
-- Jalankan di Supabase Dashboard → SQL Editor
--
-- Tabel pendaftaran sekolah yang BOLEH menggunakan aplikasi.
-- Sekolah wajib didaftarkan super admin sebelum bisa login.
-- Akses ke tabel ini hanya lewat API serverless (service role);
-- tidak ada policy RLS untuk pengguna biasa.
-- ============================================================

-- 1) Tabel pendaftaran sekolah
create table if not exists public.sekolah_daftar (
  npsn text primary key,              -- NPSN 8 digit (kunci sekolah)
  nama text not null default '',
  jenjang text not null default '',
  alamat text not null default '',
  kabupaten text not null default '',
  provinsi text not null default '',
  status text not null default 'aktif', -- 'aktif' | 'nonaktif'
  keterangan text not null default '',
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.sekolah_daftar enable row level security;

-- Tidak ada policy untuk authenticated — hanya service role (via API).

-- 2) Seed: sekolah yang sudah berjalan (agar login yang ada tetap bisa)
insert into public.sekolah_daftar (npsn, nama, jenjang, keterangan)
values
  ('20328901', 'SMP Negeri 1 Nusantara (Contoh)', 'SMP', 'Data contoh bawaan aplikasi'),
  ('00000000', 'Sekolah Uji Super Admin', 'SMP', 'Akun uji pemilik aplikasi')
on conflict (npsn) do nothing;

-- 3) Super admin: pemilik aplikasi mendapat peran superadmin.
--    (pengguna pertama yang login pada instalasi baru juga otomatis
--    menjadi superadmin lewat bootstrap API)
update public.users_meta
set role = 'superadmin'
where email = 'sardin@sekolah.sch.id' and role = 'admin';

-- 4) is_admin() kini mencakup superadmin (untuk policy users_meta)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users_meta
    where id = auth.uid()::text and role in ('admin', 'superadmin')
  );
$$;

grant execute on function public.is_admin() to authenticated;
