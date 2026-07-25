// Canonical URL for an opportunity. Descriptive path once the listing has a
// slug (see migration-034); falls back to the legacy /opportunities/<id> route
// until the slug migration is applied, so the app works before AND after it.
//
// Resolution is by slug alone (globally unique) — the city and org segments are
// descriptive only, and the detail route 308-redirects any mismatch to the
// canonical path, so a stale city/org in a shared link self-heals.

import { slugify, citySlug, cityOf, stateOf, isRemote } from './opportunityFilters'

export function orgSlug(org) {
  return slugify(org?.name || '') || 'organization'
}

// The first path segment: real "city-state" when we know it, else a stable
// bucket so remote/location-less listings still get a valid, canonical URL.
export function opportunityCitySegment(opp) {
  const c = citySlug(cityOf(opp), stateOf(opp))
  if (c) return c
  if (isRemote(opp)) return 'online'
  const st = stateOf(opp)
  return st ? slugify(st) : 'nationwide'
}

export function opportunityPath(opp) {
  if (!opp) return '/'
  if (!opp.slug) return `/opportunities/${opp.id}`
  return `/volunteer/${opportunityCitySegment(opp)}/${orgSlug(opp.org)}/${opp.slug}`
}
