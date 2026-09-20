// Approximate city-center coordinates for the cities in the directory. No
// geocoding API needed — opportunities only store city/state text, so the
// map looks them up here. Only local (non-remote) opportunities get a pin;
// remote/national orgs stay list-only (they have no single location).
//
// Keeping the map current: cityCoordFor first tries an exact "City, ST"
// match below, then falls back to the STATE_CENTERS point (nudged a little
// by the city name so different unknown cities in a state don't stack on the
// exact same spot). That fallback means a brand-new listing in a city we
// haven't added yet STILL gets a pin near the right state instead of silently
// vanishing from the map. Add an exact entry here when you want it precise.
export const CITY_COORDS = {
  // --- Major metros (other states) ---
  'New York, NY': [40.7128, -74.006],
  'Los Angeles, CA': [34.0522, -118.2437],
  'Pasadena, CA': [34.1478, -118.1445],
  'San Francisco, CA': [37.7749, -122.4194],
  'Chicago, IL': [41.8781, -87.6298],
  'Houston, TX': [29.7604, -95.3698],
  'Dallas, TX': [32.7767, -96.797],
  'Austin, TX': [30.2672, -97.7431],
  'San Antonio, TX': [29.4241, -98.4936],
  'Phoenix, AZ': [33.4484, -112.074],
  'Philadelphia, PA': [39.9526, -75.1652],
  'Seattle, WA': [47.6062, -122.3321],
  'Denver, CO': [39.7392, -104.9903],
  'Boston, MA': [42.3601, -71.0589],
  'Miami, FL': [25.7617, -80.1918],
  'Minneapolis, MN': [44.9778, -93.265],
  'Portland, OR': [45.5152, -122.6784],
  'Washington, DC': [38.9072, -77.0369],
  'Baltimore, MD': [39.2904, -76.6122],
  'Arlington, VA': [38.8799, -77.1068],

  // --- Georgia (the directory's home base) ---
  'Atlanta, GA': [33.749, -84.388],
  'Savannah, GA': [32.0809, -81.0912],
  'Athens, GA': [33.9519, -83.3576],
  'Columbus, GA': [32.461, -84.9877],
  'Augusta, GA': [33.4735, -82.0105],
  'Macon, GA': [32.8407, -83.6324],
  'Roswell, GA': [34.0232, -84.3616],
  'Marietta, GA': [33.9526, -84.5499],
  'Decatur, GA': [33.7748, -84.2963],
  'Lawrenceville, GA': [33.9562, -83.988],
  'Kennesaw, GA': [34.0234, -84.6155],
  'Gainesville, GA': [34.2979, -83.8241],
  'Duluth, GA': [34.0029, -84.1446],
  'Cumming, GA': [34.2073, -84.1402],
  'Cartersville, GA': [34.1651, -84.7999],
  'Valdosta, GA': [30.8327, -83.2785],
  'Smyrna, GA': [33.884, -84.5144],
  'Newnan, GA': [33.3807, -84.7997],
  'Fayetteville, GA': [33.4487, -84.4549],
  'Dunwoody, GA': [33.9462, -84.3346],
  'Brunswick, GA': [31.1499, -81.4915],
  'Albany, GA': [31.5785, -84.1557],
  'Warner Robins, GA': [32.613, -83.6242],
  'Stone Mountain, GA': [33.8082, -84.1702],
  'Sandy Springs, GA': [33.9304, -84.3733],
  'Peachtree City, GA': [33.3968, -84.5963],
  'Norcross, GA': [33.9412, -84.2135],
  'Clarkston, GA': [33.8098, -84.2396],
  'Chamblee, GA': [33.892, -84.2988],
  'Canton, GA': [34.2368, -84.4908],
  'Alpharetta, GA': [34.0754, -84.2941],
  'Woodstock, GA': [34.1015, -84.5194],
  'Woodbine, GA': [30.966, -81.7248],
  'Watkinsville, GA': [33.8629, -83.4088],
  'Tybee Island, GA': [32.0001, -80.8456],
  'Tucker, GA': [33.8545, -84.2171],
  'Tifton, GA': [31.4505, -83.5085],
  'Suwanee, GA': [34.0515, -84.0713],
  'Statesboro, GA': [32.4488, -81.7832],
  'St. Simons Island, GA': [31.151, -81.3901],
  'St. Marys, GA': [30.7305, -81.5465],
  'Rutledge, GA': [33.6254, -83.611],
  'Rome, GA': [34.257, -85.1647],
  'Rabun Gap, GA': [34.9612, -83.4038],
  'Pembroke, GA': [32.1349, -81.6238],
  'Palmetto, GA': [33.5182, -84.6683],
  'Moultrie, GA': [31.1799, -83.789],
  'Morrow, GA': [33.5829, -84.3391],
  'Monroe, GA': [33.7948, -83.7132],
  'McDonough, GA': [33.4473, -84.1469],
  'Mansfield, GA': [33.5187, -83.7355],
  'Mableton, GA': [33.8187, -84.5766],
  'Locust Grove, GA': [33.3468, -84.1091],
  'Lithonia, GA': [33.7123, -84.1052],
  'LaGrange, GA': [33.0362, -85.0322],
  'Johns Creek, GA': [34.0289, -84.1986],
  'Jekyll Island, GA': [31.068, -81.412],
  'Hoschton, GA': [34.0968, -83.7613],
  'Good Hope, GA': [33.794, -83.6088],
  'Forest Park, GA': [33.6221, -84.3691],
  'Ellijay, GA': [34.6948, -84.4821],
  'Ellenwood, GA': [33.6376, -84.286],
  'East Point, GA': [33.6795, -84.4394],
  'Douglasville, GA': [33.7515, -84.7477],
  'Darien, GA': [31.3702, -81.4343],
  'Dalton, GA': [34.7698, -84.9702],
  'Dallas, GA': [33.9243, -84.8408],
  'Conyers, GA': [33.6676, -84.0177],
  'Carrollton, GA': [33.5801, -85.0766],
  'Avondale Estates, GA': [33.7712, -84.2624],
  'Austell, GA': [33.8134, -84.6344],
  // Two statewide GA orgs seeded without one fixed city — Atlanta stands in.
  'Georgia, GA': [33.749, -84.388],
}

// Fallback anchor per state so any city we haven't added an exact point for
// still lands near the right place instead of being dropped from the map.
const STATE_CENTERS = {
  AL: [32.7794, -86.8287], AK: [64.0685, -152.2782], AZ: [34.2744, -111.6602],
  AR: [34.8938, -92.4426], CA: [37.1841, -119.4696], CO: [38.9972, -105.5478],
  CT: [41.6219, -72.7273], DE: [38.9896, -75.505], DC: [38.9101, -77.0147],
  FL: [28.6305, -82.4497], GA: [32.6415, -83.4426], HI: [20.2927, -156.3737],
  ID: [44.3509, -114.613], IL: [40.0417, -89.1965], IN: [39.8942, -86.2816],
  IA: [42.0751, -93.496], KS: [38.4937, -98.3804], KY: [37.5347, -85.3021],
  LA: [31.0689, -91.9968], ME: [45.3695, -69.2428], MD: [39.055, -76.7909],
  MA: [42.2596, -71.8083], MI: [44.3467, -85.4102], MN: [46.2807, -94.3053],
  MS: [32.7364, -89.6678], MO: [38.3566, -92.458], MT: [47.0527, -109.6333],
  NE: [41.5378, -99.7951], NV: [39.3289, -116.6312], NH: [43.6805, -71.5811],
  NJ: [40.1907, -74.6728], NM: [34.4071, -106.1126], NY: [42.9538, -75.5268],
  NC: [35.5557, -79.3877], ND: [47.4501, -100.4659], OH: [40.2862, -82.7937],
  OK: [35.5889, -97.4943], OR: [43.9336, -120.5583], PA: [40.8781, -77.7996],
  RI: [41.6762, -71.5562], SC: [33.9169, -80.8964], SD: [44.4443, -100.2263],
  TN: [35.858, -86.3505], TX: [31.4757, -99.3312], UT: [39.3055, -111.6703],
  VT: [44.0687, -72.6658], VA: [37.5215, -78.8537], WA: [47.3826, -120.4472],
  WV: [38.6409, -80.6227], WI: [44.6243, -89.9941], WY: [42.9957, -107.5512],
}

// Tiny deterministic offset (roughly a few tenths of a degree) derived from a
// city name, so two unknown cities in the same state don't sit on the exact
// same pixel. Not meant to be accurate — just to keep pins from fully
// overlapping until a precise entry is added above.
function nameOffset(city) {
  let h = 0
  for (let i = 0; i < city.length; i++) h = (h * 31 + city.charCodeAt(i)) & 0xffff
  const lat = ((h % 100) / 100 - 0.5) * 0.9
  const lng = ((Math.floor(h / 100) % 100) / 100 - 0.5) * 0.9
  return [lat, lng]
}

export function cityCoordFor(city, state) {
  if (!city || !state) return null
  const exact = CITY_COORDS[`${city}, ${state}`]
  if (exact) return exact
  const center = STATE_CENTERS[state]
  if (!center) return null
  const [dLat, dLng] = nameOffset(city)
  return [center[0] + dLat, center[1] + dLng]
}
