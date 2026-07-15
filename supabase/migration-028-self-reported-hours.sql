-- Migration 028: switch hour logging to a self-reported honor system.
--
-- Volunteers now log their own hours (date served + hours), pledge that the
-- entry is accurate, and it counts as verified once that date has passed —
-- no event code and no org approval needed. The app no longer calls
-- check_in_with_code(), requestHours/approveHours, or verifyAttendance, but
-- this migration does NOT drop those objects (check_in_codes table, the
-- check_in_with_code() function, or the "org owner verifies hours" policy)
-- so nothing in the live database is destroyed — they just go unused. If
-- you ever want a QR/event-code system again, they're still here.
--
-- "Verified" is computed in the app as served_on <= today, not stored as a
-- column — so there's nothing to flip with a cron job. Legacy rows from the
-- old flow (no served_on set) keep falling back to their old status/
-- verified_by, so nothing already-verified appears to un-verify.

alter table public.hour_logs
  add column if not exists served_on date,
  add column if not exists pledge_ack boolean not null default false;

-- Sanity bound on self-reported hours. NOT VALID so it doesn't choke on any
-- existing rows — it only applies going forward.
alter table public.hour_logs
  add constraint hour_logs_hours_sane check (hours > 0 and hours <= 500) not valid;

-- Was "one hour log ever, per user per opportunity" — now a volunteer can
-- log several dated sessions for the same opportunity (e.g. a recurring
-- cleanup). Postgres treats NULL as distinct from every other value, so
-- legacy rows (served_on is null) never collide with each other or with
-- new dated rows.
drop index if exists public.hour_logs_once_per_opportunity;
create unique index if not exists hour_logs_once_per_day
  on public.hour_logs (user_id, opportunity_id, served_on);

-- Replace the old "self-log pending only" policy with a self-report policy:
-- a volunteer can log their own hours as long as they've checked the honor
-- pledge and picked a date, and nobody is trying to write a
-- verified_by-stamped row through this path (that's still reserved for the
-- dormant org-verify policy above).
drop policy if exists "log own pending hours" on public.hour_logs;
create policy "log own hours" on public.hour_logs
  for insert with check (
    auth.uid() = user_id
    and verified_by is null
    and pledge_ack = true
    and served_on is not null
  );

-- Self-reported entries are editable/deletable by their owner (honor system:
-- if you got a date or hour count wrong, fix it yourself). A row that was
-- verified another way (verified_by is not null) is never touched by these.
drop policy if exists "update own self-logged hours" on public.hour_logs;
create policy "update own self-logged hours" on public.hour_logs
  for update using (auth.uid() = user_id and verified_by is null)
  with check (auth.uid() = user_id and verified_by is null and pledge_ack = true);

drop policy if exists "delete own self-logged hours" on public.hour_logs;
create policy "delete own self-logged hours" on public.hour_logs
  for delete using (auth.uid() = user_id and verified_by is null);
