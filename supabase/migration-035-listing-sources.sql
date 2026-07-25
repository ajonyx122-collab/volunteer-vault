-- Supply-pipeline foundation (Phase 1.1): let listings come from more than
-- hand curation, and make imports idempotent + traceable.
--
-- Safe to run on the live DB with current code deployed: existing rows all
-- become source='curated' and the app ignores the new columns until the
-- ingestion code ships. Idempotent — re-running is a no-op.

-- Provenance on opportunities. 'curated' = hand-entered (today's 330),
-- 'community' = user-posted, 'idealist' (etc.) = pulled from an external API.
alter table public.opportunities add column if not exists source text not null default 'curated';
-- The external system's own id for this listing — the key we upsert on so a
-- nightly sync updates rows in place instead of duplicating them. NULL for
-- curated/community rows.
alter table public.opportunities add column if not exists external_id text;
-- When an imported row was last refreshed from its source (anti-rot / staleness).
alter table public.opportunities add column if not exists last_synced_at timestamptz;

-- Same provenance + upsert key on organizations, so imported orgs dedupe too
-- (one org row per external org, reused across its listings).
alter table public.organizations add column if not exists source text not null default 'curated';
alter table public.organizations add column if not exists external_id text;

-- Idempotent-upsert keys. Partial (external_id not null) so the many curated
-- rows with NULL external_id aren't forced unique against each other.
create unique index if not exists opportunities_source_external_id_key
  on public.opportunities (source, external_id) where external_id is not null;
create unique index if not exists organizations_source_external_id_key
  on public.organizations (source, external_id) where external_id is not null;
