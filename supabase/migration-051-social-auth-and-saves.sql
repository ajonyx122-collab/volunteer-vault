-- Migration 051: sign in with Google / phone, and account-backed saves.
--
-- 1) handle_new_user() used split_part(new.email, ...) for the username and
--    display name. Phone sign-ups have NO email, so both came out NULL and the
--    NOT NULL constraint made the whole signup fail. Google sign-ups put the
--    person's name in `full_name` / `name` (not our `display_name`), so they
--    would have shown up as their email prefix. This version handles all three.
--
-- 2) saved_opportunities: the ❤️ list used to live only in the browser
--    (localStorage). Saving now needs an account, so it follows you across
--    devices. Rows are private: you can only see/add/remove your own.
--
-- Safe to run more than once.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  email_name text := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
begin
  insert into public.profiles (id, username, display_name, school, grad_year, avatar_url)
  values (
    new.id,
    coalesce(
      meta ->> 'username',
      coalesce(email_name, 'volunteer') || '-' || left(new.id::text, 4)
    ),
    coalesce(
      nullif(meta ->> 'display_name', ''),
      nullif(meta ->> 'full_name', ''),
      nullif(meta ->> 'name', ''),
      email_name,
      'Volunteer'
    ),
    nullif(meta ->> 'school', ''),
    nullif(meta ->> 'grad_year', '')::int,
    coalesce(meta ->> 'avatar_url', meta ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create table if not exists public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

drop policy if exists "read own saves" on public.saved_opportunities;
drop policy if exists "add own saves" on public.saved_opportunities;
drop policy if exists "remove own saves" on public.saved_opportunities;

create policy "read own saves" on public.saved_opportunities
  for select using (auth.uid() = user_id);
create policy "add own saves" on public.saved_opportunities
  for insert with check (auth.uid() = user_id);
create policy "remove own saves" on public.saved_opportunities
  for delete using (auth.uid() = user_id);
