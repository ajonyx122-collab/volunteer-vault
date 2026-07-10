-- Migration 022: public "suggest an opportunity" submissions.
-- Anyone (logged in or not) can submit a suggestion; nobody but AJ (via the
-- Supabase table editor, which bypasses RLS) can read them back. Safe to re-run.

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  website text not null,
  notes text not null,
  city text,
  state text,
  submitter_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.suggestions enable row level security;

drop policy if exists "anyone can suggest an opportunity" on public.suggestions;
create policy "anyone can suggest an opportunity" on public.suggestions
  for insert with check (true);
