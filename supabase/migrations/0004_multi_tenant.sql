-- ============================================================
-- Migrasi 0004: MULTI-SEKOLAH (per NPSN)
-- Jalankan di Supabase Dashboard → SQL Editor
--
-- Setiap baris data diberi kolom npsn (kunci sekolah). RLS
-- membatasi akses: pengguna hanya melihat/menulis data sekolah
-- sesuai NPSN yang dipilih saat login.
--
-- Aman dijalankan ulang (menggunakan if exists / if not exists).
-- ============================================================

-- 1) users_meta: kolom npsn (NPSN sekolah tempat pengguna bekerja)
alter table public.users_meta add column if not exists npsn text;

-- 2) Fungsi bantu: NPSN sekolah pengguna yang sedang login.
--    security definer → bebas RLS (tidak rekursif).
create or replace function public.current_npsn()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select npsn from public.users_meta where id = auth.uid()::text limit 1;
$$;

grant execute on function public.current_npsn() to authenticated;

-- 3) Kolom npsn di semua tabel data
alter table public.sekolah        add column if not exists npsn text;
alter table public.kelas          add column if not exists npsn text;
alter table public.siswa          add column if not exists npsn text;
alter table public.mapel          add column if not exists npsn text;
alter table public.tp             add column if not exists npsn text;
alter table public.nilai          add column if not exists npsn text;
alter table public.deskripsi      add column if not exists npsn text;
alter table public.kokurikuler    add column if not exists npsn text;
alter table public.kokurikuler_hasil add column if not exists npsn text;
alter table public.ekskul         add column if not exists npsn text;
alter table public.ekskul_nilai   add column if not exists npsn text;
alter table public.kehadiran      add column if not exists npsn text;
alter table public.catatan_wali   add column if not exists npsn text;
alter table public.profil_lulusan add column if not exists npsn text;

-- 4) Data lama dianggap milik sekolah contoh (agar tetap dapat diakses)
update public.sekolah set npsn = '20328901' where npsn is null or npsn = '';
update public.kelas set npsn = '20328901' where npsn is null or npsn = '';
update public.siswa set npsn = '20328901' where npsn is null or npsn = '';
update public.mapel set npsn = '20328901' where npsn is null or npsn = '';
update public.tp set npsn = '20328901' where npsn is null or npsn = '';
update public.nilai set npsn = '20328901' where npsn is null or npsn = '';
update public.deskripsi set npsn = '20328901' where npsn is null or npsn = '';
update public.kokurikuler set npsn = '20328901' where npsn is null or npsn = '';
update public.kokurikuler_hasil set npsn = '20328901' where npsn is null or npsn = '';
update public.ekskul set npsn = '20328901' where npsn is null or npsn = '';
update public.ekskul_nilai set npsn = '20328901' where npsn is null or npsn = '';
update public.kehadiran set npsn = '20328901' where npsn is null or npsn = '';
update public.catatan_wali set npsn = '20328901' where npsn is null or npsn = '';
update public.profil_lulusan set npsn = '20328901' where npsn is null or npsn = '';

-- 5) NOT NULL + kunci utama
--    sekolah: satu baris per sekolah → PK = npsn
alter table public.sekolah drop constraint if exists sekolah_pkey;
alter table public.sekolah alter column npsn set not null;
alter table public.sekolah add primary key (npsn);

--    tabel lain: id unik per sekolah → PK komposit (id, npsn)
alter table public.kelas drop constraint if exists kelas_pkey;
alter table public.kelas alter column npsn set not null;
alter table public.kelas add primary key (id, npsn);

alter table public.siswa drop constraint if exists siswa_pkey;
alter table public.siswa alter column npsn set not null;
alter table public.siswa add primary key (id, npsn);

alter table public.mapel drop constraint if exists mapel_pkey;
alter table public.mapel alter column npsn set not null;
alter table public.mapel add primary key (id, npsn);

alter table public.tp drop constraint if exists tp_pkey;
alter table public.tp alter column npsn set not null;
alter table public.tp add primary key (id, npsn);

alter table public.nilai drop constraint if exists nilai_pkey;
alter table public.nilai alter column npsn set not null;
alter table public.nilai add primary key (id, npsn);

alter table public.deskripsi drop constraint if exists deskripsi_pkey;
alter table public.deskripsi alter column npsn set not null;
alter table public.deskripsi add primary key (id, npsn);

alter table public.kokurikuler drop constraint if exists kokurikuler_pkey;
alter table public.kokurikuler alter column npsn set not null;
alter table public.kokurikuler add primary key (id, npsn);

alter table public.kokurikuler_hasil drop constraint if exists kokurikuler_hasil_pkey;
alter table public.kokurikuler_hasil alter column npsn set not null;
alter table public.kokurikuler_hasil add primary key (id, npsn);

alter table public.ekskul drop constraint if exists ekskul_pkey;
alter table public.ekskul alter column npsn set not null;
alter table public.ekskul add primary key (id, npsn);

alter table public.ekskul_nilai drop constraint if exists ekskul_nilai_pkey;
alter table public.ekskul_nilai alter column npsn set not null;
alter table public.ekskul_nilai add primary key (id, npsn);

alter table public.kehadiran drop constraint if exists kehadiran_pkey;
alter table public.kehadiran alter column npsn set not null;
alter table public.kehadiran add primary key (id, npsn);

alter table public.catatan_wali drop constraint if exists catatan_wali_pkey;
alter table public.catatan_wali alter column npsn set not null;
alter table public.catatan_wali add primary key (id, npsn);

alter table public.profil_lulusan drop constraint if exists profil_lulusan_pkey;
alter table public.profil_lulusan alter column npsn set not null;
alter table public.profil_lulusan add primary key (id, npsn);

-- 6) Indeks pencarian per NPSN
create index if not exists idx_sekolah_npsn on public.sekolah (npsn);
create index if not exists idx_kelas_npsn on public.kelas (npsn);
create index if not exists idx_siswa_npsn on public.siswa (npsn);
create index if not exists idx_mapel_npsn on public.mapel (npsn);
create index if not exists idx_tp_npsn on public.tp (npsn);
create index if not exists idx_nilai_npsn on public.nilai (npsn);
create index if not exists idx_deskripsi_npsn on public.deskripsi (npsn);
create index if not exists idx_kokurikuler_npsn on public.kokurikuler (npsn);
create index if not exists idx_kokurikuler_hasil_npsn on public.kokurikuler_hasil (npsn);
create index if not exists idx_ekskul_npsn on public.ekskul (npsn);
create index if not exists idx_ekskul_nilai_npsn on public.ekskul_nilai (npsn);
create index if not exists idx_kehadiran_npsn on public.kehadiran (npsn);
create index if not exists idx_catatan_wali_npsn on public.catatan_wali (npsn);
create index if not exists idx_profil_lulusan_npsn on public.profil_lulusan (npsn);

-- 7) RLS: hanya data sekolah (NPSN) pengguna sendiri
do $$
declare t text;
begin
  foreach t in array array[
    'sekolah','kelas','siswa','mapel','tp','nilai','deskripsi',
    'kokurikuler','kokurikuler_hasil','ekskul','ekskul_nilai',
    'kehadiran','catatan_wali','profil_lulusan'
  ]
  loop
    execute format('drop policy if exists "all_authenticated" on public.%I', t);
    execute format('drop policy if exists %I on public.%I', t || '_tenant', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (npsn = public.current_npsn()) with check (npsn = public.current_npsn())',
      t || '_tenant', t
    );
  end loop;
end $$;
