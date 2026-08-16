-- ============================================================
-- Skema database aplikasi Rapor IKM (Supabase / PostgreSQL)
-- Jalankan di Supabase Dashboard → SQL Editor
-- Catatan: tanpa foreign key agar strategi sinkronisasi
-- "replace" per tabel aman (tidak ada efek kaskade).
-- ============================================================

create table if not exists public.sekolah (
  id int primary key,
  npsn text,
  nss text,
  nama text,
  alamat text,
  desa text,
  kecamatan text,
  kabupaten text,
  provinsi text,
  kode_pos text,
  telp text,
  email text,
  website text,
  akreditasi text,
  jenjang text,
  kurikulum text,
  tahun_pelajaran text,
  semester int,
  hari_efektif int,
  kepala_sekolah text,
  nip_kepsek text,
  batas_a int,
  batas_b int,
  batas_c int,
  updated_at timestamptz not null default now()
);

create table if not exists public.kelas (
  id text primary key,
  nama text not null,
  fase text,
  wali_kelas text,
  nip_wali text,
  updated_at timestamptz not null default now()
);

create table if not exists public.siswa (
  id text primary key,
  kelas_id text,
  nisn text,
  nis text,
  nama text not null,
  tempat_lahir text,
  tgl_lahir text,
  jenis_kelamin text,
  agama text,
  alamat text,
  nama_ayah text,
  nama_ibu text,
  pekerjaan_ayah text,
  pekerjaan_ibu text,
  updated_at timestamptz not null default now()
);

create table if not exists public.mapel (
  id text primary key,
  kelas_id text,
  kode text,
  nama text not null,
  kkm int,
  pilihan boolean not null default false,
  keterangan text,
  guru text,
  updated_at timestamptz not null default now()
);

create table if not exists public.tp (
  id text primary key,
  mapel_id text,
  kode text,
  deskripsi text,
  updated_at timestamptz not null default now()
);

create table if not exists public.nilai (
  id text primary key,
  mapel_id text,
  siswa_id text,
  tp_id text,
  nilai numeric
);

create table if not exists public.deskripsi (
  id text primary key,
  mapel_id text,
  siswa_id text,
  deskripsi text
);

create table if not exists public.kokurikuler (
  id text primary key,
  nama text not null,
  jenis text,
  deskripsi text,
  updated_at timestamptz not null default now()
);

create table if not exists public.kokurikuler_hasil (
  id text primary key,
  kokurikuler_id text,
  siswa_id text,
  hasil text
);

create table if not exists public.ekskul (
  id text primary key,
  nama text not null,
  pembina text,
  wajib boolean not null default false,
  keterangan text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ekskul_nilai (
  id text primary key,
  ekskul_id text,
  siswa_id text,
  nilai int,
  deskripsi text
);

create table if not exists public.kehadiran (
  id text primary key,
  siswa_id text,
  sakit int not null default 0,
  izin int not null default 0,
  alpha int not null default 0
);

create table if not exists public.catatan_wali (
  id text primary key,
  siswa_id text,
  catatan text
);

create table if not exists public.profil_lulusan (
  id text primary key,
  siswa_id text,
  dimensi_id text,
  deskripsi text
);

-- Hak akses pengguna (peran: admin / guru)
create table if not exists public.users_meta (
  id text primary key,
  email text not null,
  nama text default '',
  role text not null default 'guru',
  created_at timestamptz not null default now()
);

-- Fungsi bantu (security definer, bebas RLS → tidak rekursif)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.users_meta where id = auth.uid()::text and role = 'admin');
$$;

create or replace function public.users_meta_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.users_meta;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.users_meta_count() to authenticated;

-- Indeks pencarian
create index if not exists idx_siswa_kelas on public.siswa (kelas_id);
create index if not exists idx_mapel_kelas on public.mapel (kelas_id);
create index if not exists idx_tp_mapel on public.tp (mapel_id);
create index if not exists idx_nilai_mapel on public.nilai (mapel_id);
create index if not exists idx_nilai_siswa on public.nilai (siswa_id);

-- ============================================================
-- Row Level Security: hanya pengguna yang login (authenticated)
-- yang dapat membaca & menulis data.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'sekolah','kelas','siswa','mapel','tp','nilai','deskripsi',
    'kokurikuler','kokurikuler_hasil','ekskul','ekskul_nilai',
    'kehadiran','catatan_wali','profil_lulusan'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'drop policy if exists "all_authenticated" on public.%I', t);
    execute format(
      'create policy "all_authenticated" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- Kebijakan khusus users_meta (tanpa rekursi)
drop policy if exists "users_meta_select" on public.users_meta;
drop policy if exists "users_meta_insert" on public.users_meta;
drop policy if exists "users_meta_update" on public.users_meta;
drop policy if exists "users_meta_delete" on public.users_meta;

create policy "users_meta_select" on public.users_meta
  for select to authenticated
  using (id = auth.uid()::text or public.is_admin());

create policy "users_meta_insert" on public.users_meta
  for insert to authenticated
  with check (id = auth.uid()::text or public.is_admin());

create policy "users_meta_update" on public.users_meta
  for update to authenticated
  using (public.is_admin());

create policy "users_meta_delete" on public.users_meta
  for delete to authenticated
  using (public.is_admin());
