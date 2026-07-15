-- Migration 029: org contact info, an admin note field, and admin read
-- access to signups (needed for the new admin org-detail page).

alter table public.organizations
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  -- Private moderation note from an admin to this org (e.g. "please add a
  -- real description"). Shown on the org's own dashboard. NOT included in
  -- the public opportunities/organizations select in the app, so it isn't
  -- surfaced to random visitors even though row-level RLS can't hide a
  -- single column — see fetchOpportunities' explicit column list in api.js.
  add column if not exists admin_note text;

-- "admins manage any org" (migration 001) already covers UPDATE on every
-- column including the two new ones and admin_note, and "update own org"
-- already covers an org owner setting their own contact info. No new
-- policy needed for either.

-- Admins can see who signed up for ANY listing (previously only the
-- volunteer themselves or the org/organizer running it could) — powers the
-- new "how many signed up" view on the admin org-detail page.
drop policy if exists "admins read any signups" on public.signups;
create policy "admins read any signups" on public.signups
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
