-- Migration 024: an admin review panel so AJ doesn't have to hand-edit the
-- Supabase table editor every time someone adds or suggests a place.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- SECURITY: "update own profile" (existing policy) lets a user update any
-- column on their own row, since it's row-level, not column-level. Without
-- this, anyone could open dev tools and set their own is_admin to true.
-- Revoking column-level UPDATE privilege blocks that regardless of RLS —
-- only the service role (which bypasses grants) can ever flip this column.
revoke update (is_admin) on public.profiles from authenticated, anon;

-- Admins can verify/remove ANY org (on top of the existing "owners manage
-- their own org" policies — Postgres OR's multiple permissive policies).
drop policy if exists "admins manage any org" on public.organizations;
create policy "admins manage any org" on public.organizations
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins delete any org" on public.organizations;
create policy "admins delete any org" on public.organizations
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Nobody could read suggestions before (insert-only policy) — admins need to.
drop policy if exists "admins read suggestions" on public.suggestions;
create policy "admins read suggestions" on public.suggestions
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins update suggestions" on public.suggestions;
create policy "admins update suggestions" on public.suggestions
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Run this yourself after, filling in your own username, to make yourself admin:
-- update public.profiles set is_admin = true where username = 'YOUR_USERNAME_HERE';
