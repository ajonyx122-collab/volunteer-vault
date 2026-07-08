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
