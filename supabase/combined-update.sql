-- ============================================================
-- VolunteerVault — combined update (run once, top to bottom)
-- Part 1: wipe demo/test data + event-code verification
-- Part 2: real virtual-opportunity directory
-- ============================================================

-- Migration 003, part A: wipe all demo/test data (one-time).
delete from public.reports;
delete from public.reviews;
delete from public.hour_logs;
delete from public.signups;
delete from public.opportunities;
delete from public.organizations;
delete from auth.users where email in ('vaulttester2026@gmail.com', 'orgtester2026@gmail.com');

-- Migration 003, part B: event-code verification (safe to re-run).

-- Codes live in their own table so they are never readable through the public
-- opportunities API — only the org that owns the listing can see its code.
create table if not exists public.check_in_codes (
  opportunity_id uuid primary key references public.opportunities (id) on delete cascade,
  code text not null default upper(substring(md5(random()::text) from 1 for 6))
);

alter table public.check_in_codes enable row level security;

drop policy if exists "org owner sees own codes" on public.check_in_codes;
create policy "org owner sees own codes" on public.check_in_codes
  for select using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = check_in_codes.opportunity_id and g.owner_id = auth.uid()
    )
  );

-- Every new listing automatically gets a code.
create or replace function public.gen_check_in_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.check_in_codes (opportunity_id) values (new.id)
  on conflict (opportunity_id) do nothing;
  return new;
end $$;

drop trigger if exists opportunities_gen_code on public.opportunities;
create trigger opportunities_gen_code
  after insert on public.opportunities
  for each row execute function public.gen_check_in_code();

-- Volunteers may only self-log PENDING hours; verified status comes from the
-- org (tap/approve) or the event code below.
drop policy if exists "log own hours" on public.hour_logs;
drop policy if exists "log own pending hours" on public.hour_logs;
create policy "log own pending hours" on public.hour_logs
  for insert with check (auth.uid() = user_id and status = 'pending' and verified_by is null);

-- Org owners can approve (update) hour logs on their listings.
drop policy if exists "org owner approves hours" on public.hour_logs;
create policy "org owner approves hours" on public.hour_logs
  for update using (
    exists (
      select 1 from public.opportunities o
      join public.organizations g on g.id = o.org_id
      where o.id = hour_logs.opportunity_id and g.owner_id = auth.uid()
    )
  );

-- The instant-verify path: volunteer types the event code, and if it matches,
-- verified hours are written server-side (no way to fake it from the client).
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


-- Migration 004: "external listing" support + a starter directory of real,
-- reputable virtual volunteer programs. Run once in the Supabase SQL editor
-- (safe to re-run — the inserts use fixed IDs with on-conflict-do-nothing).
--
-- These are EXTERNAL listings: the hosting orgs aren't on VolunteerVault, so
-- volunteers register on the org's own site (external_url). They exist to make
-- the site useful on day one while real orgs are recruited.

alter table public.opportunities add column if not exists external_url text;
alter table public.opportunities add column if not exists is_ongoing boolean not null default false;

insert into public.organizations (id, name, verified, description, location, website) values
  ('d1000000-0000-4000-8000-000000000001', 'UPchieve', false, 'Free online tutoring and college counseling for low-income high schoolers.', 'Online', 'https://upchieve.org'),
  ('d1000000-0000-4000-8000-000000000002', 'Learn To Be', false, 'One-on-one online tutoring for K-12 students in under-resourced communities.', 'Online', 'https://www.learntobe.org'),
  ('d1000000-0000-4000-8000-000000000003', 'Smithsonian Transcription Center', false, 'Public volunteers help transcribe the Smithsonian''s historical collections.', 'Online', 'https://transcription.si.edu'),
  ('d1000000-0000-4000-8000-000000000004', 'Zooniverse', false, 'The world''s largest platform for people-powered research.', 'Online', 'https://www.zooniverse.org'),
  ('d1000000-0000-4000-8000-000000000005', 'Be My Eyes', false, 'Connects blind and low-vision people with sighted volunteers by live video.', 'Online', 'https://www.bemyeyes.com'),
  ('d1000000-0000-4000-8000-000000000006', 'Crisis Text Line', false, 'Free, 24/7 mental health support over text, powered by trained volunteers.', 'Online', 'https://www.crisistextline.org'),
  ('d1000000-0000-4000-8000-000000000007', 'Tarjimly', false, 'Real-time translation for refugees, asylum seekers, and aid workers.', 'Online', 'https://www.tarjimly.org'),
  ('d1000000-0000-4000-8000-000000000008', 'TED Translators', false, 'A global volunteer community subtitling TED Talks into every language.', 'Online', 'https://www.ted.com'),
  ('d1000000-0000-4000-8000-000000000009', 'UN Online Volunteering', false, 'Support UN and nonprofit projects worldwide, entirely online.', 'Online', 'https://www.onlinevolunteering.org'),
  ('d1000000-0000-4000-8000-000000000010', 'DOROT', false, 'Fights social isolation among older adults through friendly connection.', 'Online', 'https://www.dorotusa.org')
on conflict (id) do nothing;

-- starts_at is required by the schema; for ongoing programs it's a nominal
-- value and the UI shows "Ongoing" instead of a date (is_ongoing = true).
insert into public.opportunities
  (id, org_id, title, category, description, starts_at, duration_hours, min_age, is_online, is_ongoing, external_url, tags)
values
  ('d2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Online Tutor — Math, Science & More', 'education',
   'Tutor low-income high schoolers 1:1 in 20+ subjects, whenever you''re free. You get a text when a student needs help, hop on, and help them through it. No minimum commitment, training included.',
   '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://app.upchieve.org/sign-up/volunteer/account', array['no experience needed','counts for NHS','recurring']),

  ('d2000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000002', 'Be a 1:1 Online Tutor', 'education',
   'Meet weekly with a K-12 student who needs a little extra support. You pick your subjects and schedule, Learn To Be handles the matching and gives you training to start strong.',
   '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.learntobe.org/volunteers', array['no experience needed','recurring']),

  ('d2000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000003', 'Transcribe History for the Smithsonian', 'community',
   'Help unlock the Smithsonian''s archives by transcribing handwritten letters, journals, and records so anyone can search them. Do five minutes or five hours — every page helps.',
   '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://transcription.si.edu', array['no experience needed','one-time','creative work']),

  ('d2000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000004', 'Citizen Science with Zooniverse', 'tech',
   'Join real research from your laptop: classify distant galaxies, tag wildlife on trail cameras, or decode old ship logs. Tiny tasks that add up to real scientific discoveries.',
   '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://www.zooniverse.org/projects', array['no experience needed','one-time']),

  ('d2000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000005', 'Lend Your Eyes to Someone Who''s Blind', 'community',
   'Get a call now and then from a blind or low-vision person who needs a quick pair of eyes — reading a label, checking an expiration date, finding something they dropped. Takes minutes, means a lot.',
   '2026-07-15T00:00:00Z', 1, 17, true, true, 'https://www.bemyeyes.com/become-a-volunteer', array['no experience needed','recurring']),

  ('d2000000-0000-4000-8000-000000000006', 'd1000000-0000-4000-8000-000000000006', 'Volunteer Crisis Counselor', 'medicine',
   'Support people through their hardest moments over text. This is a serious, deeply meaningful role with full training and a real time commitment — for mature volunteers ready to show up consistently.',
   '2026-07-15T00:00:00Z', 4, 18, true, true, 'https://www.crisistextline.org/become-a-volunteer/', array['leadership role','recurring']),

  ('d2000000-0000-4000-8000-000000000007', 'd1000000-0000-4000-8000-000000000007', 'Translate for Refugees (Tarjimly)', 'community',
   'Speak two languages? Get matched in real time with refugees, asylum seekers, and aid workers who need translation help through the Tarjimly app. Jump in when you have a few minutes.',
   '2026-07-15T00:00:00Z', 1, 16, true, true, 'https://www.tarjimly.org/get-involved', array['recurring']),

  ('d2000000-0000-4000-8000-000000000008', 'd1000000-0000-4000-8000-000000000008', 'Subtitle TED Talks in Your Language', 'education',
   'Help great ideas cross language barriers by transcribing and translating TED Talks. Work at your own pace and see your name in the credits of talks watched worldwide.',
   '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.ted.com/participate/translate', array['creative work','one-time']),

  ('d2000000-0000-4000-8000-000000000009', 'd1000000-0000-4000-8000-000000000009', 'Online Volunteer with the UN', 'community',
   'Support UN agencies and nonprofits around the world from your laptop — writing, research, design, translation, data, and more. Pick a project that fits your skills.',
   '2026-07-15T00:00:00Z', 1, 16, true, true, 'https://www.onlinevolunteering.org', array['leadership role','creative work']),

  ('d2000000-0000-4000-8000-000000000010', 'd1000000-0000-4000-8000-000000000010', 'Friendly Calls with Older Adults', 'seniors',
   'Brighten an older adult''s week with a warm 30-minute phone call. Low-pressure, no experience needed, and genuinely one of the most meaningful hours you''ll give.',
   '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.dorotusa.org/volunteer', array['no experience needed','recurring'])
on conflict (id) do nothing;
