-- Migration 002: structured listing locations + org-side hour verification.
-- Run once in the Supabase SQL editor (safe to re-run).

alter table public.opportunities add column if not exists city text;
alter table public.opportunities add column if not exists state text;
alter table public.opportunities add column if not exists zip text;

-- One hour log per volunteer per opportunity, so double-taps can't double hours.
create unique index if not exists hour_logs_once_per_opportunity
  on public.hour_logs (user_id, opportunity_id);

-- Org owners can see and update signups on their own listings (to mark attendance).
drop policy if exists "org owner reads listing signups" on public.signups;
create policy "org owner reads listing signups" on public.signups
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id and g.owner_id = auth.uid()
    )
  );

drop policy if exists "org owner updates listing signups" on public.signups;
create policy "org owner updates listing signups" on public.signups
  for update using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id and g.owner_id = auth.uid()
    )
  );

-- Org owners can insert verified hour logs for volunteers on their listings.
drop policy if exists "org owner verifies hours" on public.hour_logs;
create policy "org owner verifies hours" on public.hour_logs
  for insert to authenticated with check (
    verified_by = auth.uid()
    and exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = hour_logs.opportunity_id and g.owner_id = auth.uid()
    )
  );
