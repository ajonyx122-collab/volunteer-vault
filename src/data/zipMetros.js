// Opportunities store city/state text but no ZIP, so a raw ZIP in the location
// box used to match nothing and wipe the results. This maps the first 3 digits
// of a ZIP (the "ZIP3" / sectional-center prefix) to the metro it belongs to,
// for the metros that actually have listings in the directory. Typing an
// Atlanta ZIP now refines to Atlanta instead of emptying the page.
//
// It's intentionally coarse — one representative city per prefix. Unknown
// prefixes fall through (see zipToPlace) and the UI just says it couldn't
// place that ZIP rather than showing nothing.
const ZIP3_METRO = {
  // Georgia
  '300': ['Atlanta', 'GA'], '301': ['Atlanta', 'GA'], '302': ['Atlanta', 'GA'],
  '303': ['Atlanta', 'GA'], '306': ['Athens', 'GA'], '308': ['Augusta', 'GA'],
  '309': ['Augusta', 'GA'], '310': ['Macon', 'GA'], '312': ['Macon', 'GA'],
  '314': ['Savannah', 'GA'], '316': ['Valdosta', 'GA'], '317': ['Albany', 'GA'],
  '318': ['Columbus', 'GA'], '319': ['Columbus', 'GA'],
  // Other metros in the directory
  '100': ['New York', 'NY'], '101': ['New York', 'NY'], '102': ['New York', 'NY'],
  '103': ['New York', 'NY'], '104': ['New York', 'NY'],
  '900': ['Los Angeles', 'CA'], '901': ['Los Angeles', 'CA'], '911': ['Pasadena', 'CA'],
  '941': ['San Francisco', 'CA'],
  '606': ['Chicago', 'IL'],
  '770': ['Houston', 'TX'], '772': ['Houston', 'TX'],
  '752': ['Dallas', 'TX'], '753': ['Dallas', 'TX'],
  '787': ['Austin', 'TX'], '782': ['San Antonio', 'TX'],
  '850': ['Phoenix', 'AZ'], '852': ['Phoenix', 'AZ'], '853': ['Phoenix', 'AZ'],
  '191': ['Philadelphia', 'PA'],
  '981': ['Seattle', 'WA'],
  '802': ['Denver', 'CO'],
  '021': ['Boston', 'MA'], '022': ['Boston', 'MA'],
  '331': ['Miami', 'FL'],
  '554': ['Minneapolis', 'MN'], '555': ['Minneapolis', 'MN'],
  '970': ['Portland', 'OR'], '972': ['Portland', 'OR'],
  '200': ['Washington', 'DC'], '202': ['Washington', 'DC'], '203': ['Washington', 'DC'],
  '212': ['Baltimore', 'MD'], '210': ['Baltimore', 'MD'],
}

// Returns { city, state } for a 3-to-5 digit ZIP, or null if we don't know it.
export function zipToPlace(zip) {
  const digits = String(zip).replace(/\D/g, '')
  if (digits.length < 3) return null
  const hit = ZIP3_METRO[digits.slice(0, 3)]
  return hit ? { city: hit[0], state: hit[1] } : null
}

export const looksLikeZip = (s) => /^\s*\d{3,5}\s*$/.test(s)
