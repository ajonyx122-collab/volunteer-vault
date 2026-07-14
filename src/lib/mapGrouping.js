import { cityCoordFor } from '../data/cityCoords'

// Groups opportunities by city so a map marker represents "everything
// happening in this area" instead of one pin per listing — clicking a
// region should surface all of it, not just whichever pin happened to be on
// top. Remote/online listings have no single location, so they're excluded
// here (they stay list-only on Browse, same rule as the full map already
// followed).
export function groupOpportunitiesByCity(opportunities) {
  const groups = new Map()
  for (const o of opportunities) {
    if (o.isOnline || o.remote || o.org?.remote) continue
    const city = o.city || o.org?.city
    const state = o.state || o.org?.state
    const position = cityCoordFor(city, state)
    if (!position) continue
    const key = `${city}, ${state}`
    if (!groups.has(key)) groups.set(key, { key, city, state, position, items: [] })
    groups.get(key).items.push(o)
  }
  return [...groups.values()]
}
