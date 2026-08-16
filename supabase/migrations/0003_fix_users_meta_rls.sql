-- ============================================================
-- Migrasi 0003: PERBAIKAN RLS users_meta (infinite recursion)
-- Jalankan di Supabase Dashboard → SQL Editor
--
-- Masalah: policy SELECT pada users_meta memuat subquery
-- "exists (select ... from users_meta ...)" yang memicu
-- rekursi tak terbatas (infinite recursion detected).
-- Solusi: fungsi security definer (bebas RLS) untuk cek admin.
-- ============================================================

-- 1) Hapus policy lama yang rekursif
drop policy if exists "users_meta_select" on public.users_meta;
drop policy if exists "users_meta_insert" on public.users_meta;
drop policy if exists "users_meta_update" on public.users_meta;
drop policy if exists "users_meta_delete" on public.users_meta;

-- 2) Fungsi bantu: apakah pengguna saat ini admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users_meta
    where id = auth.uid()::text and role = 'admin'
  );
$$;

-- 3) Fungsi bantu: jumlah baris users_meta (untuk bootstrap admin pertama)
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

-- 4) Policy baru (tanpa rekursi)
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
