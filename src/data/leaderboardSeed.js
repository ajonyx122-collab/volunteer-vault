// -------------------------------------------------------------------------
// TEMPORARY placeholder leaderboard people.
//
// AJ asked to seed the leaderboard with ~100 fake volunteers so it doesn't
// look empty before real users arrive. These are NOT real people: generic
// "First L." names only, no schools, no usernames, no vault links. They are
// merged into the rankings in buildLeaderboards (src/lib/api.js) and are the
// ONLY place fake data enters the app.
//
// >>> TO REMOVE LATER: delete this file and the SEED_PEOPLE block + import in
//     src/lib/api.js. Nothing else depends on it. <<<
// -------------------------------------------------------------------------
import { CATEGORIES } from './mockData'

const FIRST_NAMES = [
  'Ava', 'Liam', 'Maya', 'Noah', 'Ella', 'Kai', 'Zoe', 'Owen', 'Nina', 'Leo',
  'Mia', 'Eli', 'Ivy', 'Jax', 'Lena', 'Cole', 'Aria', 'Finn', 'Remy', 'Tara',
  'Dev', 'Nora', 'Sam', 'Ruby', 'Theo', 'Luna', 'Ezra', 'June', 'Nash', 'Wren',
  'Beau', 'Sage', 'Ravi', 'Iris', 'Milo', 'Priya', 'Jude', 'Esme', 'Rhea', 'Omar',
  'Skye', 'Gus', 'Vera', 'Ada', 'Kian', 'Faye', 'Reid', 'Nia', 'Tao', 'Cleo',
]
const LAST_INITIALS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'P', 'R', 'S', 'T', 'V', 'W']

// Deterministic (no runtime randomness): the list is identical on every render
// and between server and client, so it can never cause a hydration mismatch.
function buildSeedPeople(count = 100) {
  const people = []
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const initial = LAST_INITIALS[Math.floor(i / FIRST_NAMES.length) % LAST_INITIALS.length]
    // Roughly descending all-time hours with a little wiggle so it's not a
    // perfectly smooth curve. Range ~ 280 down to single digits.
    const allTime = Math.max(1, Math.round(280 * Math.pow(0.965, i)) + (((i * 13) % 9) - 4))
    // This-month hours: a varying fraction so the monthly board reorders.
    const month = Math.round(allTime * (0.08 + (((i * 7) % 13) / 40)))
    // Streak weeks: unrelated to hours so the streak board looks different.
    const streak = (((i * 5 + 3) % 15) + 1)
    const category = CATEGORIES[(i * 3) % CATEGORIES.length].id
    people.push({
      id: `seed-${i}`,
      name: `${first} ${initial}.`,
      allTime,
      month,
      streak,
      category,
    })
  }
  return people
}

export const SEED_PEOPLE = buildSeedPeople(100)
