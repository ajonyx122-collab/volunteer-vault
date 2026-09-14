-- Migration 042: fix two duplicates introduced by migration-036.
-- Migration-036 re-added "Atlanta Community Food Bank" and "LifeLine Animal
-- Project" (ids c1...001 and c1...009), which already existed in the original
-- curated directory under ids e5...024 and e5...025. This removes the duplicate
-- copies created by 036; the original directory entries remain.
--
-- opportunities, check_in_codes, signups, reviews all reference organizations/
-- opportunities with ON DELETE CASCADE, so deleting the two org rows also removes
-- their opportunities (c2...001, c2...009) and any dependent rows automatically.
-- Safe to re-run (deletes are idempotent). Migration-036 has been edited to no
-- longer insert these two rows, so re-running 036 will not recreate them.

delete from public.organizations
where id in (
  'c1000000-0000-4000-8000-000000000001',  -- Atlanta Community Food Bank (dup of e5...024)
  'c1000000-0000-4000-8000-000000000009'   -- LifeLine Animal Project (dup of e5...025)
);
