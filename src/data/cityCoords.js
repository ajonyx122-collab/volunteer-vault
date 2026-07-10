// Approximate city-center coordinates for the metros in the directory. No
// geocoding API needed — opportunities only store city/state text, so the
// map looks them up here. Only local (non-remote) opportunities in a known
// city get a pin; everything else stays list-only, per the "only local
// opportunities belong on a map" rule (national/remote orgs have no single
// location to point to).
export const CITY_COORDS = {
  'New York, NY': [40.7128, -74.006],
  'Los Angeles, CA': [34.0522, -118.2437],
  'Pasadena, CA': [34.1478, -118.1445],
  'San Francisco, CA': [37.7749, -122.4194],
  'Chicago, IL': [41.8781, -87.6298],
  'Houston, TX': [29.7604, -95.3698],
  'Dallas, TX': [32.7767, -96.797],
  'Phoenix, AZ': [33.4484, -112.074],
  'Philadelphia, PA': [39.9526, -75.1652],
  'Seattle, WA': [47.6062, -122.3321],
  'Denver, CO': [39.7392, -104.9903],
  'Boston, MA': [42.3601, -71.0589],
  'Miami, FL': [25.7617, -80.1918],
  'Atlanta, GA': [33.749, -84.388],
  // "Georgia, GA" covers two statewide orgs seeded without one fixed city
  // (Georgia Wildlife Federation, Special Olympics Georgia) — Atlanta stands
  // in as their representative point.
  'Georgia, GA': [33.749, -84.388],
  'Minneapolis, MN': [44.9778, -93.265],
}

export function cityCoordFor(city, state) {
  if (!city || !state) return null
  return CITY_COORDS[`${city}, ${state}`] ?? null
}
