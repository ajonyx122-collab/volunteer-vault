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
    imageUrl: row.image_url,
    website: row.website,
    ownerId: row.owner_id,
    // directory fields (migration 005)
    category: row.category,
    remote: row.remote ?? false,
    international: row.international ?? false,
    minAge: row.min_age,
    country: row.country,
    state: row.state,
    city: row.city,
    countsForServiceHours: row.counts_for_service_hours ?? true,
    commitmentType: row.commitment_type ?? 'both',
    featured: row.featured ?? false,
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
    isOnline: row.is_online ?? false,
    remote: row.remote ?? row.is_online ?? false,
    tags: row.tags ?? [],
    city: row.city,
    state: row.state,
    zip: row.zip,
    hoursEstimate: row.hours_estimate ?? null,
    signupLink: row.signup_link ?? row.external_url ?? null,
    externalUrl: row.external_url ?? row.signup_link ?? null,
    isOngoing: row.is_ongoing ?? false,
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

export async function updateProfile(userId, { displayName, school, gradYear }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      school: school?.trim() || null,
      grad_year: gradYear || null,
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function reportOpportunity(opportunityId, userId, reason) {
  const { error } = await supabase
    .from('reports')
    .insert({ opportunity_id: opportunityId, user_id: userId, reason })
  if (error) throw error
}

export async function submitSuggestion({ orgName, website, notes, city, state, submitterEmail }) {
  const { error } = await supabase.from('suggestions').insert({
    org_name: orgName,
    website,
    notes,
    city: city || null,
    state: state || null,
    submitter_email: submitterEmail || null,
  })
  if (error) throw error
}

export async function fetchHourLogs(userId) {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities(title, category, organizations(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Everything the volunteer has RSVP'd to, upcoming first.
export async function fetchMySignups(userId) {
  const { data, error } = await supabase
    .from('signups')
    .select('id, status, opportunity_id, opportunities(id, title, starts_at, is_online, address, city, state, organizations(name))')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? [])
    .filter((s) => s.opportunities)
    .map((s) => ({
      signupId: s.id,
      status: s.status,
      opportunityId: s.opportunities.id,
      title: s.opportunities.title,
      startsAt: s.opportunities.starts_at,
      isOnline: s.opportunities.is_online,
      place: s.opportunities.is_online
        ? 'Online'
        : [s.opportunities.city, s.opportunities.state].filter(Boolean).join(', ') ||
          s.opportunities.address ||
          '',
      orgName: s.opportunities.organizations?.name ?? '',
    }))
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
}

// Org side: who signed up for a listing. signups has no direct FK to
// profiles, so names come from a second query.
export async function fetchListingSignups(opportunityId) {
  const { data, error } = await supabase
    .from('signups')
    .select('id, user_id, status')
    .eq('opportunity_id', opportunityId)
  if (error) throw error
  const signups = data ?? []
  if (signups.length === 0) return []
  const [{ data: profiles }, { data: logs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', signups.map((s) => s.user_id)),
    supabase
      .from('hour_logs')
      .select('id, user_id, hours, status')
      .eq('opportunity_id', opportunityId),
  ])
  const byId = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const logByUser = Object.fromEntries((logs ?? []).map((l) => [l.user_id, l]))
  return signups.map((s) => ({
    id: s.id,
    userId: s.user_id,
    status: s.status,
    displayName: byId[s.user_id]?.display_name ?? 'Volunteer',
    username: byId[s.user_id]?.username ?? '',
    hourLog: logByUser[s.user_id] ?? null,
  }))
}

// Instant self-verification: the volunteer types the event code the org
// announced. Validation and the verified hour log happen inside the database
// function, so the client can't fake it.
export async function checkInWithCode(opportunityId, code) {
  const { error } = await supabase.rpc('check_in_with_code', {
    p_opportunity: opportunityId,
    p_code: code,
  })
  if (error) throw error
}

// Backup path: volunteer requests hours (pending), org approves later.
export async function requestHours(userId, opportunityId, hours) {
  const { error } = await supabase.from('hour_logs').insert({
    user_id: userId,
    opportunity_id: opportunityId,
    hours: Number(hours),
    status: 'pending',
  })
  if (error && error.code !== '23505') throw error
}

export async function approveHours(logId) {
  const { error } = await supabase.from('hour_logs').update({ status: 'verified' }).eq('id', logId)
  if (error) throw error
}

export async function fetchMyHourLog(userId, opportunityId) {
  const { data } = await supabase
    .from('hour_logs')
    .select('id, hours, status')
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  return data ?? null
}

// Only returns a value for the org that owns the listing (RLS).
export async function fetchCheckInCode(opportunityId) {
  const { data } = await supabase
    .from('check_in_codes')
    .select('code')
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  return data?.code ?? null
}

// Marks a volunteer attended and writes a verified hour log in one go. The
// unique index means a double-tap can't double anyone's hours.
export async function verifyAttendance({ opportunityId, volunteerId, hours, orgOwnerId }) {
  const { error: signupErr } = await supabase
    .from('signups')
    .update({ status: 'attended' })
    .eq('opportunity_id', opportunityId)
    .eq('user_id', volunteerId)
  if (signupErr) throw signupErr
  const { error: logErr } = await supabase.from('hour_logs').insert({
    user_id: volunteerId,
    opportunity_id: opportunityId,
    hours: Number(hours),
    status: 'verified',
    verified_by: orgOwnerId,
  })
  // 23505 = already verified once — treat as success, not a failure
  if (logErr && logErr.code !== '23505') throw logErr
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
    orgName: l.opportunities?.organizations?.name ?? '',
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

// A volunteer quick-adding a place they know, distinct from createOrganization:
// submitted_by tracks who flagged it without making them its dashboard owner,
// so it never collides with a real org account (see migration 023).
export async function createCommunityOrg(userId, { name, location, website }) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ submitted_by: userId, name, location, website: website || null })
    .select()
    .single()
  if (error) throw error
  return mapOrg(data)
}

export async function updateOrganization(orgId, { description, website }) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ description: description?.trim() || null, website: website?.trim() || null })
    .eq('id', orgId)
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

// draft.dates is an array of datetime strings — one listing per date, so a
// recurring event (weekly cleanup etc.) shows up on each day it happens.
export async function createOpportunity(orgId, draft) {
  const dates = draft.dates?.length ? draft.dates : [draft.startsAt]
  const rows = dates.map((startsAt) => ({
    org_id: orgId,
    title: draft.title,
    category: draft.category,
    description: draft.description,
    starts_at: startsAt,
    duration_hours: Number(draft.durationHours),
    address: draft.isOnline ? null : draft.address,
    city: draft.isOnline ? null : draft.city?.trim() || null,
    state: draft.isOnline ? null : draft.state || null,
    zip: draft.isOnline ? null : draft.zip?.trim() || null,
    capacity: Number(draft.capacity),
    min_age: Number(draft.minAge),
    is_online: Boolean(draft.isOnline),
    is_ongoing: Boolean(draft.isOngoing),
    tags: draft.tags ?? [],
  }))
  const { data, error } = await supabase.from('opportunities').insert(rows).select()
  if (error) throw error
  return (data ?? []).map((row) => mapOpportunity(row))
}
