import { supabase } from './supabaseClient'

// DB columns are snake_case; components use camelCase. All mapping happens
// here so the pages never care where the data came from.

function mapOrg(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    verified: row.verified,
    description: row.description,
    location: row.location,
    logoUrl: row.logo_url,
    ownerId: row.owner_id,
  }
}

function vibeFromReviews(reviews) {
  if (!reviews?.length) return null
  const total = reviews.reduce(
    (sum, r) => sum + (r.rating_organized + r.rating_welcoming + r.rating_impactful) / 3,
    0,
  )
  return Math.round((total / reviews.length) * 10) / 10
}

function mapOpportunity(row, counts = {}) {
  return {
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    category: row.category,
    description: row.description,
    startsAt: row.starts_at,
    durationHours: Number(row.duration_hours),
    address: row.address,
    capacity: row.capacity,
    minAge: row.min_age,
    spotsFilled: counts[row.id] ?? 0,
    vibeRating: vibeFromReviews(row.reviews),
    reviewQuote: row.reviews?.[0]?.quote ?? '',
    goingFriends: [], // social layer lands in Phase 3
    tags: [],
    distanceMiles: null, // needs geo, Phase 3 map work
    org: mapOrg(row.organizations),
  }
}

function mapReview(row) {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    reviewerName: row.reviewer_name,
    date: row.created_at,
    ratings: {
      organized: row.rating_organized,
      welcoming: row.rating_welcoming,
      impactful: row.rating_impactful,
    },
    quote: row.quote,
    tip: row.tip,
    photos: (row.photo_urls ?? []).map((url, i) => ({ id: `${row.id}-${i}`, url })),
  }
}

async function fetchSignupCounts() {
  const { data } = await supabase.from('signup_counts').select('*')
  return Object.fromEntries((data ?? []).map((r) => [r.opportunity_id, r.signed_up]))
}

const OPP_SELECT = '*, organizations(*), reviews(rating_organized, rating_welcoming, rating_impactful, quote)'

export async function fetchOpportunities() {
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).order('starts_at'),
    fetchSignupCounts(),
  ])
  if (error) throw error
  return (data ?? []).map((row) => mapOpportunity(row, counts))
}

export async function fetchOpportunity(id) {
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).eq('id', id).maybeSingle(),
    fetchSignupCounts(),
  ])
  if (error) throw error
  return data ? mapOpportunity(data, counts) : null
}

export async function fetchReviews(opportunityId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapReview)
}

export async function addReview({ opportunityId, userId, reviewerName, ratings, quote, tip }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      opportunity_id: opportunityId,
      user_id: userId,
      reviewer_name: reviewerName,
      rating_organized: ratings.organized,
      rating_welcoming: ratings.welcoming,
      rating_impactful: ratings.impactful,
      quote,
      tip,
    })
    .select()
    .single()
  if (error) throw error
  return mapReview(data)
}

export async function fetchMySignup(userId, opportunityId) {
  const { data } = await supabase
    .from('signups')
    .select('id, status')
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  return data ?? null
}

export async function rsvp(userId, opportunityId) {
  const { error } = await supabase.from('signups').insert({ user_id: userId, opportunity_id: opportunityId })
  if (error) throw error
}

export async function cancelRsvp(userId, opportunityId) {
  const { error } = await supabase
    .from('signups')
    .delete()
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)
  if (error) throw error
}

export async function fetchProfileByUsername(username) {
  const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle()
  return data ?? null
}

export async function fetchHourLogs(userId) {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities(title, category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Turns a raw profile + hour logs into everything VaultView/Certificate render:
// stats, badges (earned + next locked), cause breakdown, activity list.
export function buildVaultData(profileRow, hourLogRows) {
  const logs = hourLogRows ?? []
  const verifiedHours = logs
    .filter((l) => l.status === 'verified')
    .reduce((sum, l) => sum + Number(l.hours), 0)
  const totalHours = logs.reduce((sum, l) => sum + Number(l.hours), 0)

  const causeMap = {}
  logs.forEach((l) => {
    const cat = l.opportunities?.category
    if (!cat) return
    causeMap[cat] = (causeMap[cat] ?? 0) + Number(l.hours)
  })
  const causes = Object.entries(causeMap)
    .map(([category, hours]) => ({ category, hours }))
    .sort((a, b) => b.hours - a.hours)

  // Weekly streak: consecutive calendar weeks (ending this week) with a log.
  const weeksWithLogs = new Set(
    logs.map((l) => {
      const d = new Date(l.created_at)
      const firstJan = new Date(d.getFullYear(), 0, 1)
      return `${d.getFullYear()}-${Math.floor((d - firstJan) / (7 * 24 * 3600 * 1000))}`
    }),
  )
  let streakWeeks = 0
  const now = new Date()
  for (;;) {
    const check = new Date(now - streakWeeks * 7 * 24 * 3600 * 1000)
    const firstJan = new Date(check.getFullYear(), 0, 1)
    const key = `${check.getFullYear()}-${Math.floor((check - firstJan) / (7 * 24 * 3600 * 1000))}`
    if (!weeksWithLogs.has(key)) break
    streakWeeks++
  }

  const badges = [
    { id: 'first-shift', label: 'First shift', earned: logs.length > 0 },
    { id: '10-hours', label: '10 hours', earned: totalHours >= 10, progressHours: totalHours, targetHours: 10 },
    { id: '50-hours', label: '50 hours', earned: totalHours >= 50, progressHours: totalHours, targetHours: 50 },
    { id: '100-hours', label: '100 hours', earned: totalHours >= 100, progressHours: totalHours, targetHours: 100 },
  ]
  // Show earned badges plus only the next locked one, like the wireframe.
  const nextLocked = badges.find((b) => !b.earned)
  const shelf = badges.filter((b) => b.earned).concat(nextLocked ? [nextLocked] : [])

  const activity = logs.map((l) => ({
    id: l.id,
    title: l.opportunities?.title ?? 'Logged hours',
    date: l.created_at,
    hours: Number(l.hours),
    status: l.status,
  }))

  return {
    user: {
      id: profileRow.id,
      username: profileRow.username,
      displayName: profileRow.display_name,
      school: profileRow.school,
      gradYear: profileRow.grad_year,
      avatarUrl: profileRow.avatar_url,
      verifiedHours,
      streakWeeks,
      causes,
      badges: shelf,
    },
    activity,
  }
}

export async function fetchMyOrganization(userId) {
  const { data } = await supabase.from('organizations').select('*').eq('owner_id', userId).maybeSingle()
  return mapOrg(data)
}

export async function createOrganization(userId, { name, location }) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ owner_id: userId, name, location })
    .select()
    .single()
  if (error) throw error
  return mapOrg(data)
}

export async function fetchOrgOpportunities(orgId) {
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).eq('org_id', orgId).order('starts_at'),
    fetchSignupCounts(),
  ])
  if (error) throw error
  return (data ?? []).map((row) => mapOpportunity(row, counts))
}

export async function createOpportunity(orgId, draft) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      org_id: orgId,
      title: draft.title,
      category: draft.category,
      description: draft.description,
      starts_at: draft.startsAt,
      duration_hours: Number(draft.durationHours),
      address: draft.address,
      capacity: Number(draft.capacity),
      min_age: Number(draft.minAge),
    })
    .select()
    .single()
  if (error) throw error
  return mapOpportunity(data)
}
