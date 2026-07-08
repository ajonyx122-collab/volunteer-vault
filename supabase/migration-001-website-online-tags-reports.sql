-- Migration 001: org websites, online opportunities, tags, report button.
-- Run this once in the Supabase SQL editor (safe to re-run).

alter table public.organizations add column if not exists website text;
alter table public.opportunities add column if not exists is_online boolean not null default false;
alter table public.opportunities add column if not exists tags text[] not null default '{}';

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "logged-in users can report" on public.reports;
create policy "logged-in users can report" on public.reports
  for insert to authenticated with check (true);
