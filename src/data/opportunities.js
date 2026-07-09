// Structured data layer for the public, no-login directory (Week 1, Task 1).
// The directory is a new front door; it does not touch the existing login app.
//
// Data lives in ./opportunities.json. Validate it any time with `npm run validate:data`.

import opportunities from './opportunities.json' with { type: 'json' }

/**
 * @typedef {Object} Opportunity
 * @property {string}   id            Slug, unique across the file.
 * @property {string}   name          Organization / program name.
 * @property {string}   url           External site the student visits to start.
 * @property {string[]} categories    One or more category labels.
 * @property {number|null} minAge     Minimum age. null = all ages; 0 = all ages with a parent.
 * @property {string}   ageNote       Human-readable age note, e.g. "13+ to create an account".
 * @property {boolean}  ageVerified   false = the age requirement should be confirmed on the org site.
 * @property {boolean}  virtual       true = can be done remotely.
 * @property {boolean}  national      true = available anywhere in the US.
 * @property {boolean}  verifiesHours true = the org formally verifies service hours.
 * @property {string}   description   1–2 student-friendly sentences.
 */

/** @type {Opportunity[]} */
const ALL = opportunities

/**
 * Every opportunity, in file order.
 * @returns {Opportunity[]}
 */
export function getAll() {
  return ALL
}

/**
 * Opportunities tagged with the given category (case-insensitive).
 * @param {string} cat
 * @param {Opportunity[]} [list=ALL]
 * @returns {Opportunity[]}
 */
export function getByCategory(cat, list = ALL) {
  if (!cat) return list
  const needle = cat.toLowerCase()
  return list.filter((o) => o.categories.some((c) => c.toLowerCase() === needle))
}

/**
 * Opportunities open to a volunteer of the given age.
 * An entry with minAge null or 0 is open to everyone; otherwise minAge <= age.
 * @param {number} age
 * @param {Opportunity[]} [list=ALL]
 * @returns {Opportunity[]}
 */
export function getByMaxAge(age, list = ALL) {
  return list.filter((o) => o.minAge == null || o.minAge <= age)
}

/**
 * Opportunities that can be done virtually.
 * @param {Opportunity[]} [list=ALL]
 * @returns {Opportunity[]}
 */
export function getVirtual(list = ALL) {
  return list.filter((o) => o.virtual)
}

/**
 * Opportunities where the org formally verifies service hours.
 * @param {Opportunity[]} [list=ALL]
 * @returns {Opportunity[]}
 */
export function getVerifying(list = ALL) {
  return list.filter((o) => o.verifiesHours)
}

/**
 * Sorted, de-duplicated list of every category used in the data — handy for
 * building filter chips without hard-coding the labels.
 * @returns {string[]}
 */
export function getCategories() {
  const set = new Set()
  for (const o of ALL) for (const c of o.categories) set.add(c)
  return [...set].sort()
}
