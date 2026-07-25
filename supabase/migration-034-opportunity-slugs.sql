-- Descriptive-URL migration: give every opportunity a stable, unique slug so
-- listings live at /volunteer/<city>/<org>/<slug> instead of /opportunities/<uuid>.
--
-- Safe to run on the live DB while the OLD code is still deployed: the app
-- ignores the column until the new build ships. Idempotent — re-running is a
-- no-op.

-- 1. The column (nullable for now so the backfill can populate it).
alter table public.opportunities add column if not exists slug text;

-- 2. Backfill existing rows. Base slug = slugified title; collisions get a
--    numeric suffix (-2, -3, ...) ordered by id so results are deterministic.
with base as (
  select
    id,
    coalesce(
      nullif(regexp_replace(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'), ''),
      'listing'
    ) as base_slug
  from public.opportunities
  where slug is null or slug = ''
),
numbered as (
  select id, base_slug,
         row_number() over (partition by base_slug order by id) as rn
  from base
)
update public.opportunities o
set slug = case when n.rn = 1 then n.base_slug else n.base_slug || '-' || n.rn end
from numbered n
where o.id = n.id;

-- 3. Enforce uniqueness going forward.
create unique index if not exists opportunities_slug_key on public.opportunities (slug);

-- 4. Auto-generate a unique slug on insert when one isn't supplied, so the app
--    (and any manual insert) never has to compute it. Existing slugs are never
--    touched, so editing a title does NOT change a live URL.
create or replace function public.set_opportunity_slug()
returns trigger as $$
declare
  base_slug text;
  candidate text;
  n int := 1;
begin
  if new.slug is null or new.slug = '' then
    base_slug := coalesce(
      nullif(regexp_replace(regexp_replace(lower(coalesce(new.title, 'listing')), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'), ''),
      'listing'
    );
    candidate := base_slug;
    while exists (select 1 from public.opportunities where slug = candidate) loop
      n := n + 1;
      candidate := base_slug || '-' || n;
    end loop;
    new.slug := candidate;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_opportunity_slug on public.opportunities;
create trigger trg_set_opportunity_slug
  before insert on public.opportunities
  for each row execute function public.set_opportunity_slug();
