-- Migration 027: give community-post organizers (submitted_by) the same
-- management toolkit real org accounts (owner_id) already have — seeing who
-- RSVP'd, verifying attendance/hours, and viewing their event check-in code.
-- This is how an organizer finds out who signed up, instead of email.

drop policy if exists "org owner reads listing signups" on public.signups;
create policy "org owner reads listing signups" on public.signups
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );

drop policy if exists "org owner updates listing signups" on public.signups;
create policy "org owner updates listing signups" on public.signups
  for update using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );

drop policy if exists "org owner verifies hours" on public.hour_logs;
create policy "org owner verifies hours" on public.hour_logs
  for insert to authenticated with check (
    verified_by = auth.uid()
    and exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = hour_logs.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );

drop policy if exists "org owner sees own codes" on public.check_in_codes;
create policy "org owner sees own codes" on public.check_in_codes
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = check_in_codes.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );
