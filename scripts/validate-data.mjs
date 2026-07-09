// Validates src/data/opportunities.json. Fails loudly (exit 1) on any bad entry
// so a broken directory can never ship. Run with `npm run validate:data`.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = resolve(__dirname, '../src/data/opportunities.json')

/** Field -> validator. Each returns true if the value is acceptable. */
const isString = (v) => typeof v === 'string' && v.trim().length > 0
const isBool = (v) => typeof v === 'boolean'
const isStringArray = (v) => Array.isArray(v) && v.length > 0 && v.every(isString)
const isMinAge = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0)
const isUrl = (v) => {
  if (typeof v !== 'string') return false
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const CHECKS = {
  id: isString,
  name: isString,
  url: isUrl,
  categories: isStringArray,
  minAge: isMinAge,
  ageNote: isString,
  ageVerified: isBool,
  virtual: isBool,
  national: isBool,
  verifiesHours: isBool,
  description: isString,
}

function validate(data) {
  const errors = []

  if (!Array.isArray(data)) {
    return ['Top level is not an array of opportunities.']
  }

  const seenIds = new Set()

  data.forEach((entry, i) => {
    const label = entry && entry.id ? `#${i} (${entry.id})` : `#${i}`

    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${label}: entry is not an object.`)
      return
    }

    for (const [field, check] of Object.entries(CHECKS)) {
      if (!(field in entry)) {
        errors.push(`${label}: missing required field "${field}".`)
      } else if (!check(entry[field])) {
        errors.push(`${label}: field "${field}" is invalid (got ${JSON.stringify(entry[field])}).`)
      }
    }

    if (isString(entry.id)) {
      if (seenIds.has(entry.id)) errors.push(`${label}: duplicate id "${entry.id}".`)
      seenIds.add(entry.id)
    }
  })

  return errors
}

async function main() {
  let raw
  try {
    raw = await readFile(DATA_PATH, 'utf8')
  } catch (err) {
    console.error(`✗ Could not read ${DATA_PATH}\n  ${err.message}`)
    process.exit(1)
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    console.error(`✗ ${DATA_PATH} is not valid JSON\n  ${err.message}`)
    process.exit(1)
  }

  const errors = validate(data)

  if (errors.length > 0) {
    console.error(`✗ opportunities.json failed validation — ${errors.length} problem(s):\n`)
    for (const e of errors) console.error(`  • ${e}`)
    process.exit(1)
  }

  console.log(`✓ opportunities.json is valid — ${data.length} opportunities, all fields well-formed.`)
}

main()
