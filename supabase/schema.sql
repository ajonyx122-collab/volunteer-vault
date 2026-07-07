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
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  verified boolean not null default false,
  description text,
  location text,
  logo_url text,
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
  hours numeric not null,
  status text not null default 'pending' check (status in ('pending', 'verified')),
  verified_by uuid references auth.users (id),
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
create policy "create org as self" on public.organizations for insert with check (auth.uid() = owner_id);
create policy "update own org" on public.organizations for update using (auth.uid() = owner_id);

create policy "opportunities are public" on public.opportunities for select using (true);
create policy "org owner creates listings" on public.opportunities for insert
  with check (exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid()));
create policy "org owner updates listings" on public.opportunities for update
  using (exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid()));
create policy "org owner deletes listings" on public.opportunities for delete
  using (exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid()));

create policy "read own signups" on public.signups for select using (auth.uid() = user_id);
create policy "rsvp as self" on public.signups for insert with check (auth.uid() = user_id);
create policy "update own signup" on public.signups for update using (auth.uid() = user_id);
create policy "cancel own signup" on public.signups for delete using (auth.uid() = user_id);

create policy "hour logs are public" on public.hour_logs for select using (true);
create policy "log own hours" on public.hour_logs for insert with check (auth.uid() = user_id);

create policy "reviews are public" on public.reviews for select using (true);
create policy "review as self" on public.reviews for insert with check (auth.uid() = user_id);

-- Spots-left counts without exposing who signed up: a view that only returns
-- totals. Views run as their owner, so this works even though signups are private.
create view public.signup_counts as
  select opportunity_id, count(*)::int as signed_up
  from public.signups
  where status = 'rsvp'
  group by opportunity_id;

grant select on public.signup_counts to anon, authenticated;

-- ============ STARTER DATA ============
-- Fixed UUIDs so re-running this block is easy to reason about.

insert into public.organizations (id, name, verified, description, location) values
  ('11111111-1111-1111-1111-111111111101', 'Green Shore Coalition', true, 'Community-run beach and waterway cleanups across the county.', 'Riverside Park'),
  ('11111111-1111-1111-1111-111111111102', 'Second Bowl Food Rescue', true, 'Rescuing surplus food and getting it to families who need it.', 'Downtown Community Kitchen'),
  ('11111111-1111-1111-1111-111111111103', 'Paws & Purpose Shelter', true, 'No-kill animal shelter running on volunteer power.', 'Westside Animal Shelter'),
  ('11111111-1111-1111-1111-111111111104', 'Brushstrokes Youth Arts', false, 'Free art programs for elementary schoolers, run by teen mentors.', 'Lincoln Community Center'),
  ('11111111-1111-1111-1111-111111111105', 'Sunrise Senior Companions', true, 'Friendly visits, music, and games with residents at local senior homes.', 'Maple Grove Senior Living');

insert into public.opportunities (id, org_id, title, category, description, starts_at, duration_hours, address, capacity, min_age) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Riverside Beach Cleanup', 'environment',
   'Grab a bag and gloves — we''re clearing plastic and debris along the river trail before the summer crowds hit. Snacks and music provided.',
   '2026-07-12 09:00:00-04', 2, 'Riverside Park, Main Entrance', 40, 12),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Weekend Food Rescue Sort', 'food',
   'Sort and pack rescued grocery surplus into family boxes. Indoors, easy pace, great for a first shift.',
   '2026-07-13 13:00:00-04', 3, 'Downtown Community Kitchen', 20, 14),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'Shelter Dog Walking Shift', 'animals',
   'Walk and socialize shelter dogs so they stay happy and adoptable. Comfortable shoes required.',
   '2026-07-11 16:00:00-04', 2, 'Westside Animal Shelter', 15, 13),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'After-School Art Studio Helpers', 'art',
   'Help elementary kids with painting and craft projects. No experience needed, just patience and good vibes.',
   '2026-07-14 15:30:00-04', 1.5, 'Lincoln Community Center', 10, 14),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'Senior Center Music & Games Afternoon', 'music',
   'Play board games, cards, and requested songs with residents. Bring an instrument if you''ve got one.',
   '2026-07-13 14:00:00-04', 2, 'Maple Grove Senior Living', 12, 12),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111101', 'Trailhead Native Planting Day', 'environment',
   'Plant native shrubs and grasses to fight erosion along the north trailhead. Tools and gloves provided.',
   '2026-07-19 09:00:00-04', 3, 'North Trailhead Lot', 25, 12);

insert into public.reviews (opportunity_id, reviewer_name, rating_organized, rating_welcoming, rating_impactful, quote, tip) values
  ('22222222-2222-2222-2222-222222222201', 'Maya P.', 5, 5, 4, 'Way more fun than I expected — bring a hoodie, it''s breezy by the water.', 'Wear shoes you don''t mind getting sandy.'),
  ('22222222-2222-2222-2222-222222222201', 'Theo R.', 4, 5, 5, 'Filled two whole bags in an hour, felt like we actually made a dent.', 'Get there right at 9 — parking fills up fast.'),
  ('22222222-2222-2222-2222-222222222202', 'Jordan K.', 5, 5, 4, 'Organized and welcoming, the staff actually explain what you''re doing.', 'It''s chilly in the warehouse, bring a light jacket.'),
  ('22222222-2222-2222-2222-222222222203', 'Priya S.', 5, 5, 5, 'Full every week for a reason. Sign up early!', 'Bring your own water bottle, it gets warm on the walking loop.'),
  ('22222222-2222-2222-2222-222222222205', 'Jordan K.', 5, 5, 5, 'Genuinely one of the sweetest hours of my week.', 'Learn a card game beforehand, residents love teaching new ones too.');
