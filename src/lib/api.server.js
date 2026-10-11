import { createServerSupabaseClient } from './supabase/server'
import { mapOpportunity, mapOrg, OPP_SELECT, STUDENT_ORG_COLUMNS } from './opportunityMapping'
import { filterActiveOpportunities } from './opportunityFilters'

// Server-side reads for the SEO-critical pages (Home, Browse, opportunity
// detail) — same tables/shape as fetchOpportunities/fetchOpportunity in
// api.js, but run in a Server Component so the listings are in the initial
// HTML instead of arriving after a client-side useEffect fetch.

async function fetchSignupCounts(supabase) {
  const { data } = await supabase.from('signup_counts').select('*')
  return Object.fromEntries((data ?? []).map((r) => [r.opportunity_id, r.signed_up]))
}

export async function fetchOpportunitiesServer() {
  const supabase = createServerSupabaseClient()
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).order('starts_at'),
    fetchSignupCounts(supabase),
  ])
  if (error) throw error
  return filterActiveOpportunities((data ?? []).map((row) => mapOpportunity(row, counts)))
}

export async function fetchOpportunityServer(id) {
  const supabase = createServerSupabaseClient()
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).eq('id', id).maybeSingle(),
    fetchSignupCounts(supabase),
  ])
  if (error) throw error
  return data ? mapOpportunity(data, counts) : null
}

// Resolve the descriptive URL's opportunity by its (globally unique) slug.
export async function fetchOpportunityBySlugServer(slug) {
  const supabase = createServerSupabaseClient()
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).eq('slug', slug).maybeSingle(),
    fetchSignupCounts(supabase),
  ])
  if (error) throw error
  return data ? mapOpportunity(data, counts) : null
}

// Minimal id list for the sitemap — no need for the full mapped shape.
export async function fetchOpportunityIdsServer() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('opportunities').select('id, starts_at')
  if (error) throw error
  return data ?? []
}

// Public leaderboard rows (no auth required) — used to server-render the
// "Top volunteers" preview on the homepage. buildLeaderboards itself is a
// pure function (see api.js) and is reused as-is from there.
export async function fetchLeaderboardDataServer() {
  const supabase = createServerSupabaseClient()
  const { data: logs, error } = await supabase
    .from('hour_logs')
    .select('user_id, hours, served_on, status, created_at, opportunities(category)')
  if (error) throw error
  const rows = logs ?? []
  const userIds = [...new Set(rows.map((r) => r.user_id))]
  if (userIds.length === 0) return { rows: [], profiles: [] }
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, display_name, school, avatar_url')
    .in('id', userIds)
  if (profErr) throw profErr
  return { rows, profiles: profiles ?? [] }
}

// ---- student-led nonprofits (/student-led) ----

// Impact numbers computed from real activity on the org's listings, so a
// founder can't just type them in: hours logged, distinct people who logged
// them, and RSVPs. hour_logs + signup_counts are both public-readable.
async function fetchImpactByOrg(supabase, orgOppIds) {
  const allOppIds = Object.values(orgOppIds).flat()
  const [counts, { data: logs }] = await Promise.all([
    fetchSignupCounts(supabase),
    allOppIds.length
      ? supabase.from('hour_logs').select('user_id, opportunity_id, hours').in('opportunity_id', allOppIds)
      : Promise.resolve({ data: [] }),
  ])
  const impact = {}
  for (const [orgId, oppIds] of Object.entries(orgOppIds)) {
    const ids = new Set(oppIds)
    const orgLogs = (logs ?? []).filter((l) => ids.has(l.opportunity_id))
    impact[orgId] = {
      listings: oppIds.length,
      rsvps: oppIds.reduce((sum, id) => sum + (counts[id] ?? 0), 0),
      volunteers: new Set(orgLogs.map((l) => l.user_id)).size,
      hours: Math.round(orgLogs.reduce((sum, l) => sum + Number(l.hours), 0)),
    }
  }
  return impact
}

export async function fetchStudentOrgsServer() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('organizations')
    .select(`${STUDENT_ORG_COLUMNS}, opportunities(id)`)
    .eq('is_student_led', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data ?? []
  const impact = await fetchImpactByOrg(
    supabase,
    Object.fromEntries(rows.map((r) => [r.id, (r.opportunities ?? []).map((o) => o.id)])),
  )
  return rows.map((r) => ({ ...mapOrg(r), impact: impact[r.id] }))
}

export async function fetchStudentOrgServer(id) {
  const supabase = createServerSupabaseClient()
  const [{ data: row, error }, { data: oppRows, error: oppErr }, counts] = await Promise.all([
    supabase.from('organizations').select(STUDENT_ORG_COLUMNS).eq('id', id).eq('is_student_led', true).maybeSingle(),
    supabase.from('opportunities').select(OPP_SELECT).eq('org_id', id).order('starts_at'),
    fetchSignupCounts(supabase),
  ])
  if (error) throw error
  if (oppErr) throw oppErr
  if (!row) return null
  const impact = await fetchImpactByOrg(supabase, { [id]: (oppRows ?? []).map((o) => o.id) })
  return {
    ...mapOrg(row),
    impact: impact[id],
    opportunities: filterActiveOpportunities((oppRows ?? []).map((r) => mapOpportunity(r, counts))),
  }
}
