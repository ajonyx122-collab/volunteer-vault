// Shared, client/server-agnostic helpers for reading an opportunity's
// location/eligibility fields and for building the city/cause directory that
// powers the /volunteer landing pages. A listing's own field always wins;
// fall back to its org's directory field (same rule the browse filters use).

import { CATEGORIES, getCategoryMeta } from '../data/mockData'

export const isRemote = (o) => o.remote || o.isOnline || o.org?.remote

// A listing is "active" if it's ongoing or its start date hasn't passed yet.
// Dated one-time events auto-expire from public lists the day after they run
// (anti-rot). Ongoing/undated listings never expire. Detail pages still render
// an expired listing directly — this only trims stale entries from lists.
export function isActiveOpportunity(o, now = new Date()) {
  if (o.isOngoing || !o.startsAt) return true
  const start = new Date(o.startsAt)
  if (Number.isNaN(start.getTime())) return true
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return start >= startOfToday
}

export function filterActiveOpportunities(opps, now = new Date()) {
  return opps.filter((o) => isActiveOpportunity(o, now))
}

export const minAgeOf = (o) => o.minAge ?? o.org?.minAge ?? 0
export const stateOf = (o) => o.state || o.org?.state || ''
export const cityOf = (o) => o.city || o.org?.city || ''
export const zipOf = (o) => o.zip || o.org?.zip || ''
export const commitmentOf = (o) => o.org?.commitmentType ?? 'both'

// URL-safe slug: lowercased, non-alphanumerics collapsed to single hyphens.
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// City landing slug carries the 2-letter state so it's unique across states
// (e.g. "savannah-ga", "san-francisco-ca"). Returns null if either part is
// missing so remote/location-less listings never mint a city page.
export function citySlug(city, state) {
  if (!city || !state) return null
  return `${slugify(city)}-${String(state).toLowerCase()}`
}

// Distinct cities that have at least one listing, most listings first. Each
// entry: { city, state, slug, label, count }. Remote/online listings have no
// single place, so they're excluded from city grouping.
export function buildLocationDirectory(opportunities) {
  const map = new Map()
  for (const o of opportunities) {
    if (isRemote(o)) continue
    const city = cityOf(o)
    const state = stateOf(o)
    const slug = citySlug(city, state)
    if (!slug) continue
    const existing = map.get(slug)
    if (existing) existing.count += 1
    else map.set(slug, { city, state, slug, label: `${city}, ${state}`, count: 1 })
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

// Causes (categories) that have at least one listing, most listings first.
// Each entry: { id, label, icon, slug, count }. The slug IS the category id,
// so cause URLs stay aligned with the ?category= filter used elsewhere.
export function buildCauseDirectory(opportunities) {
  const counts = new Map()
  for (const o of opportunities) {
    if (!o.category) continue
    counts.set(o.category, (counts.get(o.category) ?? 0) + 1)
  }
  return CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => ({ id: c.id, label: c.label, icon: c.icon, slug: c.id, count: counts.get(c.id) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

// Resolve a /volunteer/[slug] into what it points at. Cause is checked first;
// cause slugs are single category ids and city slugs always end in "-xx", so
// they can't collide. Returns { type: 'cause'|'city', ... } or null.
export function resolveLandingSlug(slug, opportunities) {
  const cause = buildCauseDirectory(opportunities).find((c) => c.slug === slug)
  if (cause) return { type: 'cause', cause }
  const city = buildLocationDirectory(opportunities).find((c) => c.slug === slug)
  if (city) return { type: 'city', city }
  return null
}

export function opportunitiesForCause(opportunities, categoryId) {
  return opportunities.filter((o) => o.category === categoryId)
}

export function opportunitiesForCity(opportunities, city, state) {
  return opportunities.filter((o) => !isRemote(o) && cityOf(o) === city && stateOf(o) === state)
}

// Re-exported for callers that only want the label/icon for a cause id.
export { getCategoryMeta }
