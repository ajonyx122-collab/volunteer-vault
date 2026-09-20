-- Migration 045: let volunteers edit and delete their own reviews.
-- Reviews already had public SELECT and self-only INSERT (see schema.sql); this
-- adds the matching UPDATE and DELETE policies, scoped to the author so no one
-- can touch anyone else's review. Safe to re-run (drops first).

drop policy if exists "update own review" on public.reviews;
create policy "update own review" on public.reviews
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own review" on public.reviews;
create policy "delete own review" on public.reviews
  for delete using (auth.uid() = user_id);
