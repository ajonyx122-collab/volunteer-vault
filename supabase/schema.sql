-- VolunteerVault Phase 1 schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: it drops and rebuilds everything (fine before launch when
-- there's no real user data; after launch, never drop — write migrations).

-- ============ CLEAN SLATE ============

drop view if exists public.signup_counts;
drop table if exists public.reviews cascade;
drop table if exists public.hour_logs cascade;
drop table if exists public.signups cascade;
drop table if exists public.opportunities cascade;
drop table if exists public.organizations cascade;
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============ TABLES ============

-- One row per user, created automatically on signup (see trigger below).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  school text,
  grad_year int,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- SECURITY: revoke column-level UPDATE on is_admin so no client-side request
-- (even one satisfying "update own profile" below) can ever self-promote.
-- Only the service role, which bypasses grants entirely, can flip it.
revoke update (is_admin) on public.profiles from authenticated, anon;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  -- Set instead of owner_id when a volunteer quick-adds a place they know
  -- without becoming its dashboard-managing account (see the insert policy
  -- below). Never both set at once.
  submitted_by uuid references auth.users (id) on delete set null,
  name text not null,
  verified boolean not null default false,
  description text,
  location text,
  logo_url text,
  website text,
  created_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  starts_at timestamptz not null,
  duration_hours numeric not null default 1,
  address text,
  lat double precision,
  lng double precision,
  capacity int not null default 10,
  min_age int not null default 12,
  is_online boolean not null default false,
  tags text[] not null default '{}',
  city text,
  state text,
  zip text,
  external_url text,
  is_ongoing boolean not null default false,
  -- set on community-organized projects (a specific one-time event someone
  -- is personally running), null on org listings and ongoing programs.
  what_to_bring text,
  created_at timestamptz not null default now()
);

-- Flagged listings land here for AJ to review in the Supabase dashboard.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Anyone can suggest an org/opportunity to add; AJ reviews in the Supabase
-- table editor (which bypasses RLS) and manually adds approved ones.
create table public.suggestions (
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

create table public.signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  status text not null default 'rsvp' check (status in ('rsvp', 'attended', 'no_show')),
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create table public.hour_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  hours numeric not null check (hours > 0 and hours <= 500),
  -- status/verified_by are legacy (org-verify flow, migration 003). New rows
  -- are self-reported: served_on is the date served, and the app computes
  -- "verified" as served_on <= today rather than storing a status.
  status text not null default 'pending' check (status in ('pending', 'verified')),
  verified_by uuid references auth.users (id),
  served_on date,
  pledge_ack boolean not null default false,
  created_at timestamptz not null default now()
);

-- reviewer_name is stored directly so seed reviews work without accounts and
-- the app never needs a join just to show a name.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  reviewer_name text not null,
  rating_organized int not null check (rating_organized between 1 and 5),
  rating_welcoming int not null check (rating_welcoming between 1 and 5),
  rating_impactful int not null check (rating_impactful between 1 and 5),
  quote text not null,
  tip text,
  photo_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, school, grad_year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '-' || left(new.id::text, 4)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'school',
    nullif(new.raw_user_meta_data ->> 'grad_year', '')::int
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============
-- Public site: anyone can READ orgs, opportunities, reviews, profiles (vaults
-- are public by design). Writes always require being logged in as the owner.

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.signups enable row level security;
alter table public.hour_logs enable row level security;
alter table public.reviews enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

create policy "orgs are public" on public.organizations for select using (true);
create policy "create org as self" on public.organizations for insert
  with check (auth.uid() = owner_id or (owner_id is null and auth.uid() = submitted_by));
create policy "update own org" on public.organizations for update using (auth.uid() = owner_id);

create policy "opportunities are public" on public.opportunities for select using (true);
create policy "org owner creates listings" on public.opportunities for insert
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = org_id and (o.owner_id = auth.uid() or o.submitted_by = auth.uid())
    )
  );
create policy "org owner updates listings" on public.opportunities for update
  using (exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid()));
create policy "org owner deletes listings" on public.opportunities for delete
  using (exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid()));

create policy "read own signups" on public.signups for select using (auth.uid() = user_id);
create policy "rsvp as self" on public.signups for insert with check (auth.uid() = user_id);
create policy "update own signup" on public.signups for update using (auth.uid() = user_id);
create policy "cancel own signup" on public.signups for delete using (auth.uid() = user_id);

create policy "hour logs are public" on public.hour_logs for select using (true);
-- (self-logging is restricted to pending status - see EVENT-CODE VERIFICATION below)

create policy "reviews are public" on public.reviews for select using (true);
create policy "review as self" on public.reviews for insert with check (auth.uid() = user_id);

alter table public.reports enable row level security;
create policy "logged-in users can report" on public.reports
  for insert to authenticated with check (true);

alter table public.suggestions enable row level security;
create policy "anyone can suggest an opportunity" on public.suggestions
  for insert with check (true);

-- Admins can verify/remove any org and read/action suggestions (on top of
-- the owner-scoped policies above — Postgres OR's multiple permissive ones).
create policy "admins manage any org" on public.organizations
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admins delete any org" on public.organizations
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admins read suggestions" on public.suggestions
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
create policy "admins update suggestions" on public.suggestions
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- A volunteer may log several dated sessions for the same opportunity (e.g.
-- a recurring cleanup), but not the same date twice. NULL served_on (legacy
-- rows) never collides, since Postgres treats NULL as distinct.
create unique index hour_logs_once_per_day on public.hour_logs (user_id, opportunity_id, served_on);

-- Org owners AND community-post organizers (submitted_by) manage signups +
-- verify hours on their own listings — this is how a community organizer
-- finds out who RSVP'd, in place of email notifications.
create policy "org owner reads listing signups" on public.signups
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );
create policy "org owner updates listing signups" on public.signups
  for update using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = signups.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );
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

-- Spots-left counts without exposing who signed up: a view that only returns
-- totals. Views run as their owner, so this works even though signups are private.
create view public.signup_counts as
  select opportunity_id, count(*)::int as signed_up
  from public.signups
  where status = 'rsvp'
  group by opportunity_id;

grant select on public.signup_counts to anon, authenticated;

-- The UI disables "Count me in" once full, but that's client-side only —
-- this makes capacity a real database rule so a direct API call or two
-- people racing for the last spot can't over-book a listing.
create or replace function public.check_signup_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_capacity int;
  v_current_count int;
begin
  select capacity into v_capacity from public.opportunities where id = new.opportunity_id;
  select coalesce(signed_up, 0) into v_current_count
    from public.signup_counts where opportunity_id = new.opportunity_id;
  if v_current_count >= v_capacity then
    raise exception 'This opportunity is full.';
  end if;
  return new;
end $$;

create trigger signups_enforce_capacity
  before insert on public.signups
  for each row execute function public.check_signup_capacity();

-- ============ EVENT-CODE VERIFICATION ============
-- Codes live in their own table so they are never readable through the public
-- opportunities API — only the org that owns the listing can see its code.
create table public.check_in_codes (
  opportunity_id uuid primary key references public.opportunities (id) on delete cascade,
  code text not null default upper(substring(md5(random()::text) from 1 for 6))
);

alter table public.check_in_codes enable row level security;
create policy "org owner sees own codes" on public.check_in_codes
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = check_in_codes.opportunity_id
        and (g.owner_id = auth.uid() or g.submitted_by = auth.uid())
    )
  );

create or replace function public.gen_check_in_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.check_in_codes (opportunity_id) values (new.id)
  on conflict (opportunity_id) do nothing;
  return new;
end $$;

create trigger opportunities_gen_code
  after insert on public.opportunities
  for each row execute function public.gen_check_in_code();

-- Self-reported honor system (migration 028): a volunteer logs their own
-- hours once they've checked the honor pledge and picked a date served;
-- "verified" is computed in the app as served_on <= today, not stored here.
-- They can edit/delete their own entries, but never one verified another
-- way (verified_by is not null) — that stays immutable.
create policy "log own hours" on public.hour_logs
  for insert with check (
    auth.uid() = user_id and verified_by is null and pledge_ack = true and served_on is not null
  );

create policy "update own self-logged hours" on public.hour_logs
  for update using (auth.uid() = user_id and verified_by is null)
  with check (auth.uid() = user_id and verified_by is null and pledge_ack = true);

create policy "delete own self-logged hours" on public.hour_logs
  for delete using (auth.uid() = user_id and verified_by is null);

-- Legacy org-verify flow (migration 003) — dormant, the app no longer calls
-- these, but they're left in place rather than dropped.
create policy "org owner approves hours" on public.hour_logs
  for update using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = hour_logs.opportunity_id and g.owner_id = auth.uid()
    )
  );

-- Instant verify: volunteer types the event code; validation + verified log
-- happen server-side so the client cannot fake it.
create or replace function public.check_in_with_code(p_opportunity uuid, p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_hours numeric;
  v_owner uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.';
  end if;

  select o.duration_hours, g.owner_id, c.code
    into v_hours, v_owner, v_code
  from public.opportunities o
  join public.organizations g on g.id = o.org_id
  join public.check_in_codes c on c.opportunity_id = o.id
  where o.id = p_opportunity;

  if v_code is null then
    raise exception 'This opportunity has no check-in code.';
  end if;
  if upper(trim(p_code)) <> v_code then
    raise exception 'That code does not match — double-check with the organizer.';
  end if;

  insert into public.hour_logs (user_id, opportunity_id, hours, status, verified_by)
  values (auth.uid(), p_opportunity, v_hours, 'verified', v_owner)
  on conflict (user_id, opportunity_id)
    do update set status = 'verified', hours = excluded.hours, verified_by = excluded.verified_by;

  update public.signups set status = 'attended'
  where user_id = auth.uid() and opportunity_id = p_opportunity;
end $$;
