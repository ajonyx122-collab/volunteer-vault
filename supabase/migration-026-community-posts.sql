-- Migration 026: community-organized projects (Phase 3) — any signed-in user
-- can post a one-time event with a real date/time, headcount, and what to
-- bring, not just flag an existing org. Builds on the quick-add pipeline
-- from migration 023 (submitted_by already marks "not dashboard-owned").

alter table public.opportunities add column if not exists what_to_bring text;
