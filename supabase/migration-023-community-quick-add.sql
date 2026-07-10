-- Migration 023: let signed-in volunteers directly add a real, unverified
-- place + opportunity (distinct from the anonymous "suggestions" queue used
-- by logged-out visitors, which stays a private review-only table).
--
-- owner_id stays reserved for accounts that manage a listing through the org
-- dashboard. submitted_by tracks who quick-added a place without taking on
-- dashboard ownership of it, so it can never collide with someone's real org
-- account (fetchMyOrganization expects at most one owned org per user).

alter table public.organizations add column if not exists submitted_by uuid references auth.users (id) on delete set null;

drop policy if exists "create org as self" on public.organizations;
create policy "create org as self" on public.organizations
  for insert with check (
    auth.uid() = owner_id
    or (owner_id is null and auth.uid() = submitted_by)
  );

drop policy if exists "org owner creates listings" on public.opportunities;
create policy "org owner creates listings" on public.opportunities
  for insert with check (
    exists (
      select 1 from public.organizations o
      where o.id = org_id
        and (o.owner_id = auth.uid() or o.submitted_by = auth.uid())
    )
  );
