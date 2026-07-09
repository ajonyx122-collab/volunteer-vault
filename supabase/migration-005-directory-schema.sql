-- Migration 005: directory-driven organizations + opportunities.
--
-- IMPORTANT: organizations and opportunities already exist and are load-bearing
-- (opportunities.id is referenced by hour_logs, signups, check_in_codes; the
-- auth trigger and org dashboard depend on the current shape). So this migration
-- is ADDITIVE - it adds the spec's directory fields without dropping or renaming
-- anything. Existing columns reused: name, description, website, logo_url,
-- verified (organizations); title, description, category, tags, min_age
-- (opportunities). Run once in the Supabase SQL editor (safe to re-run).

-- ---- organizations: directory fields ------------------------------------
alter table public.organizations add column if not exists category text;
alter table public.organizations add column if not exists tags text[] not null default '{}';
alter table public.organizations add column if not exists remote boolean not null default false;
alter table public.organizations add column if not exists international boolean not null default false;
alter table public.organizations add column if not exists min_age int not null default 13;
alter table public.organizations add column if not exists country text;
alter table public.organizations add column if not exists state text;
alter table public.organizations add column if not exists city text;
alter table public.organizations add column if not exists counts_for_service_hours boolean not null default true;
alter table public.organizations add column if not exists commitment_type text
  not null default 'both' check (commitment_type in ('one-time', 'ongoing', 'both'));
alter table public.organizations add column if not exists featured boolean not null default false;
alter table public.organizations add column if not exists image_url text;

-- ---- opportunities: directory fields -------------------------------------
-- organization_id already exists as org_id (same FK). remote mirrors the
-- existing is_online flag; signup_link is the directory equivalent of the
-- existing external_url.
alter table public.opportunities add column if not exists remote boolean not null default false;
alter table public.opportunities add column if not exists hours_estimate text;
alter table public.opportunities add column if not exists signup_link text;

-- Indexes for the browse filters.
create index if not exists organizations_category_idx on public.organizations (category);
create index if not exists organizations_featured_idx on public.organizations (featured);
create index if not exists organizations_state_idx on public.organizations (state);

-- Public read access for the directory (organizations are already public-select
-- under the existing "orgs are public" policy; opportunities under their own).
-- No policy changes needed - directory rows are just more public rows.
