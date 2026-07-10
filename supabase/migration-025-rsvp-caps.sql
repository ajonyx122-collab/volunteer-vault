-- Migration 025: enforce RSVP capacity at the database level.
--
-- The UI already shows "Full" and disables the button once capacity is hit,
-- but that's client-side only — nothing stopped a direct API call (or two
-- people racing for the last spot) from over-booking a listing. This trigger
-- makes the database itself the source of truth, using the exact same count
-- (status = 'rsvp') the existing signup_counts view already shows as
-- "spots left" everywhere in the app, so the two can never disagree.

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

drop trigger if exists signups_enforce_capacity on public.signups;
create trigger signups_enforce_capacity
  before insert on public.signups
  for each row execute function public.check_signup_capacity();
