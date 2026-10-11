-- Migration 052: "Become a school ambassador" interest form.
-- Anyone (logged in or not) can apply; only admins can read/update the
-- applications, from the Ambassador applications section of /admin.
-- Safe to re-run.

create table if not exists public.ambassador_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  school text not null,
  school_city text,
  school_state text,
  grad_year int,
  clubs text,              -- NHS, Key Club, student council, etc.
  why text not null,       -- why they want to do it / their ideas
  hours_per_month text,    -- rough availability bucket
  social_handle text,      -- optional Instagram/TikTok for promo collabs
  heard_from text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'accepted', 'declined')),
  admin_note text,
  created_at timestamptz not null default now()
);

alter table public.ambassador_applications enable row level security;

drop policy if exists "anyone can apply to be an ambassador" on public.ambassador_applications;
create policy "anyone can apply to be an ambassador" on public.ambassador_applications
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "admins read ambassador applications" on public.ambassador_applications;
create policy "admins read ambassador applications" on public.ambassador_applications
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins update ambassador applications" on public.ambassador_applications;
create policy "admins update ambassador applications" on public.ambassador_applications
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins delete ambassador applications" on public.ambassador_applications;
create policy "admins delete ambassador applications" on public.ambassador_applications
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
