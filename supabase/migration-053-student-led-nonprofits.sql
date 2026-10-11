-- Migration 053: student-led nonprofits (/student-led).
-- Any org can flag itself as student-founded (high school, college, or a
-- recent grad who started it in school) and fill in a founder profile:
-- mission, story, a goal with progress, and a donate link (shown publicly
-- only once an admin verifies the org). Admins can spotlight one on the
-- homepage. Safe to re-run.

alter table public.organizations add column if not exists is_student_led boolean not null default false;
alter table public.organizations add column if not exists founder_name text;
alter table public.organizations add column if not exists founder_school text;
alter table public.organizations add column if not exists founder_status text;
alter table public.organizations add column if not exists founded_year int;
alter table public.organizations add column if not exists mission text;
alter table public.organizations add column if not exists founder_story text;
alter table public.organizations add column if not exists donate_url text;
alter table public.organizations add column if not exists goal_title text;
alter table public.organizations add column if not exists goal_unit text;
alter table public.organizations add column if not exists goal_target numeric;
alter table public.organizations add column if not exists goal_current numeric;
alter table public.organizations add column if not exists spotlight boolean not null default false;

alter table public.organizations drop constraint if exists organizations_founder_status_check;
alter table public.organizations add constraint organizations_founder_status_check
  check (founder_status is null or founder_status in ('high_school', 'college', 'recent_grad'));

create index if not exists organizations_student_led_idx
  on public.organizations (is_student_led) where is_student_led;

-- SECURITY: "update own org" is row-level, so an org owner could set their
-- own verified = true (or spotlight themselves) straight from dev tools —
-- and verified now unlocks a public donate link. This trigger keeps
-- verified/spotlight/featured admin-only for website users. It only
-- applies to the API roles (anon/authenticated); the Supabase SQL Editor
-- runs as postgres, so seeding the directory there is unaffected.
create or replace function public.protect_org_admin_fields()
returns trigger
language plpgsql
-- Deliberately NOT security definer: current_user must stay the caller's
-- role (anon/authenticated) for the check below. profiles is public-read.
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  select coalesce(p.is_admin, false) into caller_is_admin
    from public.profiles p where p.id = auth.uid();
  if coalesce(caller_is_admin, false) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verified := false;
    new.spotlight := false;
    new.featured := false;
  else
    new.verified := old.verified;
    new.spotlight := old.spotlight;
    new.featured := old.featured;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_org_admin_fields on public.organizations;
create trigger protect_org_admin_fields
  before insert or update on public.organizations
  for each row execute function public.protect_org_admin_fields();
