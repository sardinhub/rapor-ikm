-- ============================================================
-- Migrasi 0002: tabel users_meta (hak akses pengguna)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.users_meta (
  id text primary key,            -- id dari auth.users
  email text not null,
  nama text default '',
  role text not null default 'guru',  -- 'admin' | 'guru'
  created_at timestamptz not null default now()
);

-- RLS: pengguna hanya bisa melihat dirinya sendiri;
-- admin (peran 'admin') dapat melihat & mengelola semua.
alter table public.users_meta enable row level security;

drop policy if exists "users_meta_select" on public.users_meta;
create policy "users_meta_select" on public.users_meta
  for select to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.users_meta m where m.id = auth.uid() and m.role = 'admin')
  );

drop policy if exists "users_meta_insert" on public.users_meta;
create policy "users_meta_insert" on public.users_meta
  for insert to authenticated
  with check (
    id = auth.uid()
    or exists (select 1 from public.users_meta m where m.id = auth.uid() and m.role = 'admin')
  );

drop policy if exists "users_meta_update" on public.users_meta;
create policy "users_meta_update" on public.users_meta
  for update to authenticated
  using (exists (select 1 from public.users_meta m where m.id = auth.uid() and m.role = 'admin'));

drop policy if exists "users_meta_delete" on public.users_meta;
create policy "users_meta_delete" on public.users_meta
  for delete to authenticated
  using (exists (select 1 from public.users_meta m where m.id = auth.uid() and m.role = 'admin'));
