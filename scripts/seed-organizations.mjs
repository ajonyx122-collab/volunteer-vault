// Seeds the directory from data/organizations.json into Supabase.
//
// Requires a service-role key (bypasses row-level security for the bulk insert):
//   SUPABASE_SERVICE_ROLE_KEY=xxxx node scripts/seed-organizations.mjs
// The URL falls back to the project URL if VITE_SUPABASE_URL isn't set.
//
// Idempotent: directory rows are the org rows with owner_id = null, so the
// script clears those first (cascading to their opportunities) and re-inserts.
// Real user-owned orgs (owner_id set) are never touched.

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.VITE_SUPABASE_URL || 'https://hcbxdgumjckrpirnesux.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!key) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Find it in Supabase → Project Settings → API → service_role secret, then run:\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=xxxx node scripts/seed-organizations.mjs',
  )
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const orgs = JSON.parse(readFileSync(path.join(root, 'data/organizations.json'), 'utf8'))

// Evergreen directory listings aren't dated events, but opportunities.starts_at
// is NOT NULL — use a fixed anchor date and flag them ongoing.
const ANCHOR = '2026-01-01T00:00:00Z'

async function main() {
  console.log(`Clearing previous directory rows (owner_id is null)...`)
  const { error: delErr } = await supabase.from('organizations').delete().is('owner_id', null)
  if (delErr) throw delErr

  let ok = 0
  for (const o of orgs) {
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        owner_id: null,
        name: o.name,
        description: o.description,
        website: o.website,
        logo_url: o.logo_url,
        category: o.category,
        tags: o.tags,
        remote: o.remote,
        international: o.international,
        min_age: o.min_age,
        country: o.country,
        state: o.state,
        city: o.city,
        verified: o.verified,
        counts_for_service_hours: o.counts_for_service_hours,
        commitment_type: o.commitment_type,
        featured: o.featured,
      })
      .select('id')
      .single()
    if (orgErr) {
      console.error(`✗ ${o.name}: ${orgErr.message}`)
      continue
    }

    const op = o.opportunity
    const { error: oppErr } = await supabase.from('opportunities').insert({
      org_id: org.id,
      title: op.title,
      category: op.category,
      description: op.description,
      tags: op.tags,
      min_age: op.min_age,
      remote: op.remote,
      is_online: op.remote, // keep existing UI in sync
      is_ongoing: true,
      hours_estimate: op.hours_estimate,
      signup_link: op.signup_link,
      external_url: op.signup_link, // existing detail page reads external_url
      starts_at: ANCHOR,
      city: o.city,
      state: o.state,
    })
    if (oppErr) {
      console.error(`✗ ${o.name} (opportunity): ${oppErr.message}`)
      continue
    }
    ok++
    console.log(`✓ ${o.name}`)
  }
  console.log(`\nSeeded ${ok}/${orgs.length} organizations + opportunities.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
