import { createServerSupabaseClient } from './supabase/server'
import { mapOpportunity, OPP_SELECT } from './opportunityMapping'

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
  return (data ?? []).map((row) => mapOpportunity(row, counts))
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
