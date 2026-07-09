-- ============================================================
-- VolunteerVault — combined update (run once, top to bottom)
-- Part 1: wipe demo/test data + event-code verification
-- Part 2: real online-volunteer directory (37 programs)
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


-- Migration 004: "external listing" support + curated directory of real,
-- reputable volunteer programs that can be done or started online. Run once in
-- the Supabase SQL editor (safe to re-run — fixed IDs, on-conflict-do-nothing).
--
-- EXTERNAL listings: hosting orgs aren't on VolunteerVault, so volunteers
-- register on the org's own site (external_url). Verify age on the org site.

alter table public.opportunities add column if not exists external_url text;
alter table public.opportunities add column if not exists is_ongoing boolean not null default false;

insert into public.organizations (id, name, verified, description, location, website) values
  ('d1000000-0000-4000-8000-000000000001', 'Zooniverse', false, 'Zooniverse — external partner listing.', 'Online', 'https://www.zooniverse.org'),
  ('d1000000-0000-4000-8000-000000000002', 'Smithsonian Transcription Center', false, 'Smithsonian Transcription Center — external partner listing.', 'Online', 'https://transcription.si.edu'),
  ('d1000000-0000-4000-8000-000000000003', 'NASA Citizen Science', false, 'NASA Citizen Science — external partner listing.', 'Online', 'https://science.nasa.gov'),
  ('d1000000-0000-4000-8000-000000000004', 'iNaturalist', false, 'iNaturalist — external partner listing.', 'Online', 'https://www.inaturalist.org'),
  ('d1000000-0000-4000-8000-000000000005', 'Ancestry World Archives Project', false, 'Ancestry World Archives Project — external partner listing.', 'Online', 'https://www.ancestry.com'),
  ('d1000000-0000-4000-8000-000000000006', 'TeensGive', false, 'TeensGive — external partner listing.', 'Online', 'https://teensgive.org'),
  ('d1000000-0000-4000-8000-000000000007', 'UPchieve', false, 'UPchieve — external partner listing.', 'Online', 'https://app.upchieve.org'),
  ('d1000000-0000-4000-8000-000000000008', 'Learn To Be', false, 'Learn To Be — external partner listing.', 'Online', 'https://www.learntobe.org'),
  ('d1000000-0000-4000-8000-000000000009', 'ScholarMatch', false, 'ScholarMatch — external partner listing.', 'Online', 'https://scholarmatch.org'),
  ('d1000000-0000-4000-8000-000000000010', 'Best Buddies', false, 'Best Buddies — external partner listing.', 'Online', 'https://www.bestbuddies.org'),
  ('d1000000-0000-4000-8000-000000000011', 'Cards for Hospitalized Kids', false, 'Cards for Hospitalized Kids — external partner listing.', 'Online', 'https://www.cardsforhospitalizedkids.com'),
  ('d1000000-0000-4000-8000-000000000012', 'Letters Against Isolation', false, 'Letters Against Isolation — external partner listing.', 'Online', 'https://www.lettersagainstisolation.com'),
  ('d1000000-0000-4000-8000-000000000013', 'Operation Gratitude', false, 'Operation Gratitude — external partner listing.', 'Online', 'https://www.operationgratitude.com'),
  ('d1000000-0000-4000-8000-000000000014', 'Love For Our Elders', false, 'Love For Our Elders — external partner listing.', 'Online', 'https://loveforourelders.org'),
  ('d1000000-0000-4000-8000-000000000015', 'Sierra Club', false, 'Sierra Club — external partner listing.', 'Online', 'https://www.sierraclub.org'),
  ('d1000000-0000-4000-8000-000000000016', 'Humane Society', false, 'Humane Society — external partner listing.', 'Online', 'https://www.humanesociety.org'),
  ('d1000000-0000-4000-8000-000000000017', 'Best Friends Animal Society', false, 'Best Friends Animal Society — external partner listing.', 'Online', 'https://bestfriends.org'),
  ('d1000000-0000-4000-8000-000000000018', 'Missing Maps', false, 'Missing Maps — external partner listing.', 'Online', 'https://www.missingmaps.org'),
  ('d1000000-0000-4000-8000-000000000019', 'Tarjimly', false, 'Tarjimly — external partner listing.', 'Online', 'https://www.tarjimly.org'),
  ('d1000000-0000-4000-8000-000000000020', 'Translators Without Borders', false, 'Translators Without Borders — external partner listing.', 'Online', 'https://translatorswithoutborders.org'),
  ('d1000000-0000-4000-8000-000000000021', 'TED Translators', false, 'TED Translators — external partner listing.', 'Online', 'https://www.ted.com'),
  ('d1000000-0000-4000-8000-000000000022', 'UN Online Volunteering', false, 'UN Online Volunteering — external partner listing.', 'Online', 'https://www.onlinevolunteering.org'),
  ('d1000000-0000-4000-8000-000000000023', 'Distributed Proofreaders', false, 'Distributed Proofreaders — external partner listing.', 'Online', 'https://www.pgdp.net'),
  ('d1000000-0000-4000-8000-000000000024', 'LibriVox', false, 'LibriVox — external partner listing.', 'Online', 'https://librivox.org'),
  ('d1000000-0000-4000-8000-000000000025', 'Mapping Prejudice', false, 'Mapping Prejudice — external partner listing.', 'Online', 'https://mappingprejudice.umn.edu'),
  ('d1000000-0000-4000-8000-000000000026', 'Wikipedia', false, 'Wikipedia — external partner listing.', 'Online', 'https://en.wikipedia.org'),
  ('d1000000-0000-4000-8000-000000000027', 'American Red Cross Youth', false, 'American Red Cross Youth — external partner listing.', 'Online', 'https://www.redcross.org'),
  ('d1000000-0000-4000-8000-000000000028', 'The Trevor Project', false, 'The Trevor Project — external partner listing.', 'Online', 'https://www.thetrevorproject.org'),
  ('d1000000-0000-4000-8000-000000000029', 'Be My Eyes', false, 'Be My Eyes — external partner listing.', 'Online', 'https://www.bemyeyes.com'),
  ('d1000000-0000-4000-8000-000000000030', 'Meals on Wheels America', false, 'Meals on Wheels America — external partner listing.', 'Online', 'https://www.mealsonwheelsamerica.org'),
  ('d1000000-0000-4000-8000-000000000031', 'Crisis Text Line', false, 'Crisis Text Line — external partner listing.', 'Online', 'https://www.crisistextline.org'),
  ('d1000000-0000-4000-8000-000000000032', 'DOROT', false, 'DOROT — external partner listing.', 'Online', 'https://www.dorotusa.org'),
  ('d1000000-0000-4000-8000-000000000033', 'Youth Volunteer Corps', false, 'Youth Volunteer Corps — external partner listing.', 'Online', 'https://www.yvc.org'),
  ('d1000000-0000-4000-8000-000000000034', 'Key Club International', false, 'Key Club International — external partner listing.', 'Online', 'https://www.keyclub.org'),
  ('d1000000-0000-4000-8000-000000000035', 'Girls on the Run', false, 'Girls on the Run — external partner listing.', 'Online', 'https://www.girlsontherun.org'),
  ('d1000000-0000-4000-8000-000000000036', 'Special Olympics', false, 'Special Olympics — external partner listing.', 'Online', 'https://www.specialolympics.org'),
  ('d1000000-0000-4000-8000-000000000037', 'Kids That Do Good', false, 'Kids That Do Good — external partner listing.', 'Online', 'https://kidsthatdogood.com')
on conflict (id) do nothing;

insert into public.opportunities
  (id, org_id, title, category, description, starts_at, duration_hours, min_age, is_online, is_ongoing, external_url, tags)
values
  ('d2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Zooniverse', 'tech', 'Join real research from your laptop: classify distant galaxies, tag wildlife on trail cameras, or decode old ship logs. Tiny tasks that add up to real scientific discoveries.', '2026-07-15T00:00:00Z', 1, 12, true, true, 'https://www.zooniverse.org/projects', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000002', 'Smithsonian Transcription Center', 'community', 'Help unlock the Smithsonian''s archives by transcribing handwritten letters, journals, and records so anyone can search them. Do five minutes or five hours — every page helps.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://transcription.si.edu', array['no experience needed', 'one-time', 'creative work']),
  ('d2000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000003', 'NASA Citizen Science', 'tech', 'Do real NASA science from home — hunt for exoplanets, classify clouds, or track landslides. Many projects have no age minimum.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://science.nasa.gov/citizen-science/', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000004', 'iNaturalist', 'environment', 'Photograph the plants and animals around you and help identify others. Your observations feed real biodiversity research worldwide.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://www.inaturalist.org', array['no experience needed', 'outdoors']),
  ('d2000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000005', 'Ancestry World Archives Project', 'community', 'Transcribe scanned historical records into a free, publicly searchable database that helps people trace their family history.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://www.ancestry.com/community', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000006', 'd1000000-0000-4000-8000-000000000006', 'TeensGive', 'education', 'High schoolers tutor kids at Title 1 schools in reading, writing, and math through 1:1 virtual sessions. Built by teens, for service hours.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://teensgive.org', array['counts for school hours', 'recurring']),
  ('d2000000-0000-4000-8000-000000000007', 'd1000000-0000-4000-8000-000000000007', 'UPchieve', 'education', 'Tutor low-income high schoolers 1:1 in 20+ subjects, whenever you''re free. You get a text when a student needs help, hop on, and help them through it.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://app.upchieve.org/sign-up/volunteer/account', array['no experience needed', 'counts for school hours', 'recurring']),
  ('d2000000-0000-4000-8000-000000000008', 'd1000000-0000-4000-8000-000000000008', 'Learn To Be', 'education', 'Meet weekly with a K-12 student who needs a little extra support. You pick your subjects and schedule; Learn To Be handles matching and training.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.learntobe.org/volunteers', array['no experience needed', 'recurring']),
  ('d2000000-0000-4000-8000-000000000009', 'd1000000-0000-4000-8000-000000000009', 'ScholarMatch', 'education', 'Coach underserved students through college and career decisions over video. Great for college-age volunteers who remember the process.', '2026-07-15T00:00:00Z', 1, 18, true, true, 'https://scholarmatch.org', array['recurring', 'leadership role']),
  ('d2000000-0000-4000-8000-000000000010', 'd1000000-0000-4000-8000-000000000010', 'Best Buddies', 'community', 'Build a genuine friendship with a peer who has an intellectual or developmental disability — through virtual chapters and e-Buddies pen-pal matches.', '2026-07-15T00:00:00Z', 1, 12, true, true, 'https://www.bestbuddies.org', array['no experience needed', 'recurring']),
  ('d2000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000011', 'Cards for Hospitalized Kids', 'community', 'Make and mail handmade cards that brighten the day of hospitalized children. All ages, and they formally verify service hours.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://www.cardsforhospitalizedkids.com', array['no experience needed', 'counts for school hours', 'creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000012', 'd1000000-0000-4000-8000-000000000012', 'Letters Against Isolation', 'seniors', 'Write and send cheerful letters to isolated seniors in care facilities around the world. All ages, do it from your kitchen table.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://www.lettersagainstisolation.com', array['no experience needed', 'creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000013', 'd1000000-0000-4000-8000-000000000013', 'Operation Gratitude', 'veterans', 'Write heartfelt thank-you letters to troops, veterans, and first responders. A simple way for any age to say thank you.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://www.operationgratitude.com', array['no experience needed', 'creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000014', 'd1000000-0000-4000-8000-000000000014', 'Love For Our Elders', 'seniors', 'Join monthly letter-writing campaigns that deliver warmth to lonely older adults. All ages welcome.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://loveforourelders.org', array['no experience needed', 'creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000015', 'd1000000-0000-4000-8000-000000000015', 'Sierra Club', 'environment', 'Join environmental-justice campaigns with real digital-action roles — spreading the word, contacting decision-makers, and organizing online.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.sierraclub.org/take-action', array['recurring']),
  ('d2000000-0000-4000-8000-000000000016', 'd1000000-0000-4000-8000-000000000016', 'Humane Society', 'animals', 'Support animal-welfare legislation through remote phone banking and digital advocacy for the nation’s largest animal-protection group.', '2026-07-15T00:00:00Z', 1, 16, true, true, 'https://www.humanesociety.org', array['recurring']),
  ('d2000000-0000-4000-8000-000000000017', 'd1000000-0000-4000-8000-000000000017', 'Best Friends Animal Society', 'animals', 'Help make the country no-kill through the largest companion-animal sanctuary network. Remote advocacy plus local hands-on roles.', '2026-07-15T00:00:00Z', 1, 13, false, true, 'https://bestfriends.org/volunteer', array['recurring']),
  ('d2000000-0000-4000-8000-000000000018', 'd1000000-0000-4000-8000-000000000018', 'Missing Maps', 'tech', 'Trace roads and buildings on satellite imagery so aid organizations can reach communities in crisis. Remote "mapathons" run year-round.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://www.missingmaps.org', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000019', 'd1000000-0000-4000-8000-000000000019', 'Tarjimly', 'community', 'Speak two languages? Get matched in real time with refugees and aid workers who need translation help through the Tarjimly app.', '2026-07-15T00:00:00Z', 1, 16, true, true, 'https://www.tarjimly.org/get-involved', array['recurring']),
  ('d2000000-0000-4000-8000-000000000020', 'd1000000-0000-4000-8000-000000000020', 'Translators Without Borders', 'community', 'Translate crisis-relief, health, and education materials for humanitarian organizations. Generally for adult/college volunteers.', '2026-07-15T00:00:00Z', 1, 18, true, true, 'https://translatorswithoutborders.org', array['recurring', 'creative work']),
  ('d2000000-0000-4000-8000-000000000021', 'd1000000-0000-4000-8000-000000000021', 'TED Translators', 'education', 'Help great ideas cross language barriers by subtitling TED Talks. Work at your own pace and see your name in the credits.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.ted.com/participate/translate', array['creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000022', 'd1000000-0000-4000-8000-000000000022', 'UN Online Volunteering', 'community', 'Support UN agencies and nonprofits worldwide from your laptop — writing, research, design, translation, and data. Bookmark for college.', '2026-07-15T00:00:00Z', 1, 18, true, true, 'https://www.onlinevolunteering.org', array['leadership role', 'creative work']),
  ('d2000000-0000-4000-8000-000000000023', 'd1000000-0000-4000-8000-000000000023', 'Distributed Proofreaders', 'education', 'Proofread a page at a time to help build Project Gutenberg, the world’s largest free digital library. Perfect for readers and writers.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://www.pgdp.net', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000024', 'd1000000-0000-4000-8000-000000000024', 'LibriVox', 'art', 'Record chapters of public-domain books to create free audiobooks anyone in the world can listen to. Your voice, real impact.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://librivox.org', array['creative work', 'one-time']),
  ('d2000000-0000-4000-8000-000000000025', 'd1000000-0000-4000-8000-000000000025', 'Mapping Prejudice', 'community', 'Transcribe historical property deeds to uncover racist housing covenants and document social injustice for researchers.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://mappingprejudice.umn.edu', array['no experience needed', 'one-time']),
  ('d2000000-0000-4000-8000-000000000026', 'd1000000-0000-4000-8000-000000000026', 'Wikipedia', 'education', 'Improve articles, add citations, and fix errors on the encyclopedia the whole world reads. Start with topics you already know.', '2026-07-15T00:00:00Z', 1, 13, true, true, 'https://en.wikipedia.org/wiki/Wikipedia:Community_portal', array['no experience needed', 'creative work']),
  ('d2000000-0000-4000-8000-000000000027', 'd1000000-0000-4000-8000-000000000027', 'American Red Cross Youth', 'medicine', 'Join or start a Red Cross Club and support disaster relief and blood-drive awareness. Virtual roles available alongside local ones.', '2026-07-15T00:00:00Z', 1, 14, false, true, 'https://www.redcross.org/volunteer/become-a-volunteer/youth-opportunities.html', array['leadership role', 'recurring']),
  ('d2000000-0000-4000-8000-000000000028', 'd1000000-0000-4000-8000-000000000028', 'The Trevor Project', 'medicine', 'Train as a crisis counselor supporting LGBTQ young people. A serious, high-impact role for adult volunteers with full training.', '2026-07-15T00:00:00Z', 1, 18, true, true, 'https://www.thetrevorproject.org/volunteer/', array['leadership role', 'recurring']),
  ('d2000000-0000-4000-8000-000000000029', 'd1000000-0000-4000-8000-000000000029', 'Be My Eyes', 'community', 'Lend your sight to someone who''s blind or low-vision through a quick live video call — read a label, check a date, find a lost item.', '2026-07-15T00:00:00Z', 1, 17, true, true, 'https://www.bemyeyes.com/become-a-volunteer', array['no experience needed', 'recurring']),
  ('d2000000-0000-4000-8000-000000000030', 'd1000000-0000-4000-8000-000000000030', 'Meals on Wheels America', 'seniors', 'Find your local chapter and help older neighbors — from making cards to delivering meals with a parent. Roles vary by location.', '2026-07-15T00:00:00Z', 1, 12, false, true, 'https://www.mealsonwheelsamerica.org/volunteer', array['no experience needed']),
  ('d2000000-0000-4000-8000-000000000031', 'd1000000-0000-4000-8000-000000000031', 'Crisis Text Line', 'medicine', 'Support people through their hardest moments over text. A serious, deeply meaningful role with full training and a real commitment.', '2026-07-15T00:00:00Z', 1, 18, true, true, 'https://www.crisistextline.org/become-a-volunteer/', array['leadership role', 'recurring']),
  ('d2000000-0000-4000-8000-000000000032', 'd1000000-0000-4000-8000-000000000032', 'DOROT', 'seniors', 'Brighten an older adult''s week with a warm 30-minute phone call. Low-pressure, no experience needed, genuinely meaningful.', '2026-07-15T00:00:00Z', 1, 14, true, true, 'https://www.dorotusa.org/volunteer', array['no experience needed', 'recurring']),
  ('d2000000-0000-4000-8000-000000000033', 'd1000000-0000-4000-8000-000000000033', 'Youth Volunteer Corps', 'community', 'Team-based service projects designed for ages 11-18 to serve together, supervised and without parents needing to tag along.', '2026-07-15T00:00:00Z', 1, 11, false, true, 'https://www.yvc.org', array['counts for school hours', 'recurring']),
  ('d2000000-0000-4000-8000-000000000034', 'd1000000-0000-4000-8000-000000000034', 'Key Club International', 'community', 'The largest student-led high school service organization. Join or start a club and lead projects in your own community.', '2026-07-15T00:00:00Z', 1, 14, false, true, 'https://www.keyclub.org', array['counts for club hours', 'leadership role', 'recurring']),
  ('d2000000-0000-4000-8000-000000000035', 'd1000000-0000-4000-8000-000000000035', 'Girls on the Run', 'sports', 'Coach, cheer, or run as a buddy to help girls build confidence through a fun running program. Teen roles available locally.', '2026-07-15T00:00:00Z', 1, 14, false, true, 'https://www.girlsontherun.org', array['recurring']),
  ('d2000000-0000-4000-8000-000000000036', 'd1000000-0000-4000-8000-000000000036', 'Special Olympics', 'sports', 'Coach, help run events, or play alongside athletes with intellectual disabilities. Virtual and school-based options through local chapters.', '2026-07-15T00:00:00Z', 1, 14, false, true, 'https://www.specialolympics.org/ways-to-get-involved', array['recurring']),
  ('d2000000-0000-4000-8000-000000000037', 'd1000000-0000-4000-8000-000000000037', 'Kids That Do Good', 'community', 'A directory built by teens for kids and families — plug into existing charities or start your own project. All ages.', '2026-07-15T00:00:00Z', 1, 0, true, true, 'https://kidsthatdogood.com', array['no experience needed'])
on conflict (id) do nothing;
