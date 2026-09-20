// -------------------------------------------------------------------------
// TEMPORARY placeholder leaderboard people.
//
// AJ asked to seed the leaderboard with ~100 volunteers so it doesn't look
// empty before real users arrive. These are NOT real people: realistic,
// diverse first+last names, no schools, no usernames, no vault links. Each
// has a spread of hours across a few categories so the "where their hours
// went" popup has something cute to show. They're merged into the rankings in
// buildLeaderboards (src/lib/api.js) and are the ONLY place fake data enters
// the app.
//
// >>> TO REMOVE LATER: delete this file and the SEED_PEOPLE block + import in
//     src/lib/api.js. Nothing else depends on it. <<<
// -------------------------------------------------------------------------
import { CATEGORIES } from './mockData'

// Deliberately diverse across many cultures/ethnicities.
const FIRST_NAMES = [
  'Sofia', 'Aiden', 'Priya', 'Malik', 'Emma', 'Diego', 'Aisha', 'Kenji', 'Olivia', 'Santiago',
  'Fatima', 'Jamal', 'Chloe', 'Wei', 'Amara', 'Ethan', 'Leila', 'Mateo', 'Zara', 'Noah',
  'Ananya', 'Andre', 'Isabella', 'Hassan', 'Grace', 'Ravi', 'Camila', 'Jin', 'Nia', 'Lucas',
  'Yara', 'Omar', 'Maya', 'Tariq', 'Elena', 'Kofi', 'Hana', 'Marcus', 'Ingrid', 'Rahul',
  'Sana', 'Dmitri', 'Rosa', 'Kwame', 'Mei', 'Julian', 'Layla', 'Sven', 'Amina', 'Tomas',
  'Keiko', 'Darius', 'Freya', 'Bilal', 'Lucia', 'Arjun', 'Naomi', 'Ibrahim', 'Valentina', 'Simone',
  'Cyrus', 'Adaeze', 'Felix', 'Noor', 'Thiago', 'Yuki', 'Zoe', 'Idris', 'Carmen', 'Anders',
]
const LAST_NAMES = [
  'Nguyen', 'Patel', 'Okafor', 'Garcia', 'Kim', 'Cohen', 'Rossi', 'Hernandez', 'Mbeki', 'Sato',
  'Ali', 'Johnson', 'Singh', 'Martinez', 'Chen', 'Ivanov', 'Diallo', 'Rodriguez', 'Lee', 'Haddad',
  'Williams', 'Sharma', 'Santos', 'Park', 'Petrov', 'Osei', 'Reyes', 'Wong', 'Khan', 'Torres',
  'Andersson', 'Mensah', 'Kaur', 'Silva', 'Yamamoto', 'Adeyemi', 'Lopez', 'Nakamura', 'Brown', 'Gupta',
  'Morales', 'Tanaka', 'Farah', 'Castillo', 'Novak', 'Owusu', 'Ramirez', 'Dubois', 'Kowalski', 'Mwangi',
  'Ferreira', 'Hassan', 'Jackson', 'Bianchi', 'Cruz', 'Nasser', 'Olsen', 'Banerjee', 'Vargas', 'Abbas',
]

// Deterministic (no runtime randomness): identical on every render and between
// server and client, so it can never cause a hydration mismatch.
function buildSeedPeople(count = 100) {
  const cats = CATEGORIES.map((c) => c.id)
  const people = []
  const usedNames = new Set()
  for (let i = 0; i < count; i++) {
    // Vary both first and last with different strides so names don't repeat and
    // last names aren't all clustered on one letter.
    let fi = (i * 7) % FIRST_NAMES.length
    let li = (i * 13 + 3) % LAST_NAMES.length
    let name = `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`
    let bump = 0
    while (usedNames.has(name) && bump < LAST_NAMES.length) {
      li = (li + 1) % LAST_NAMES.length
      name = `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`
      bump++
    }
    usedNames.add(name)

    // Roughly descending all-time hours with a little wiggle (~280 down to
    // single digits).
    const allTime = Math.max(3, Math.round(280 * Math.pow(0.965, i)) + (((i * 13) % 9) - 4))
    const month = Math.round(allTime * (0.08 + (((i * 7) % 13) / 40)))
    const streak = (((i * 5 + 3) % 15) + 1)

    // Spread the all-time hours across 2-3 categories so the "where their
    // hours went" popup shows a real little breakdown. Everyone gets a
    // different mix.
    const primary = cats[(i * 3) % cats.length]
    const secondary = cats[(i * 3 + 4) % cats.length]
    const tertiary = cats[(i * 3 + 8) % cats.length]
    const categories = {}
    const addCat = (cat, hrs) => {
      if (hrs > 0) categories[cat] = (categories[cat] ?? 0) + hrs
    }
    const pPrimary = Math.round(allTime * 0.6)
    const pSecondary = Math.round(allTime * 0.28)
    addCat(primary, pPrimary)
    addCat(secondary, pSecondary)
    addCat(tertiary, allTime - pPrimary - pSecondary)

    people.push({ id: `seed-${i}`, name, allTime, month, streak, categories })
  }
  return people
}

export const SEED_PEOPLE = buildSeedPeople(100)
