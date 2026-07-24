import { supabase } from './supabaseClient'
import { getCauseBadgeCopy } from '../data/mockData'
import { isLogVerified, logDate, computeStreakWeeks } from './hourLogs'
import { getActiveChallenge } from '../data/challenges'
import { computeChallengeProgress } from './challenges'
import { mapOrg, mapOpportunity, mapReview, OPP_SELECT } from './opportunityMapping'

export { computeStreakWeeks }

async function fetchSignupCounts() {
  const { data } = await supabase.from('signup_counts').select('*')
  return Object.fromEntries((data ?? []).map((r) => [r.opportunity_id, r.signed_up]))
}

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

// Owner-only helper: which opportunities has this user already reviewed —
// used to offer a "leave a review" link on their own vault, never on a
// public one (see fetchMyReviewedOpportunityIds callers).
export async function fetchMyReviewedOpportunityIds(userId) {
  const { data, error } = await supabase.from('reviews').select('opportunity_id').eq('user_id', userId)
  if (error) throw error
  return new Set((data ?? []).map((r) => r.opportunity_id))
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

// ---- admin review (gated in the UI by profile.is_admin; RLS also enforces it) ----

const ADMIN_OPP_PREVIEW =
  'id, title, category, description, starts_at, duration_hours, is_ongoing, is_online, capacity, min_age, tags, city, state'

export async function fetchPendingOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select(`*, opportunities(${ADMIN_OPP_PREVIEW})`)
    .eq('verified', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({ ...mapOrg(row), opportunities: row.opportunities ?? [] }))
}

export async function verifyOrganization(orgId) {
  const { error } = await supabase.from('organizations').update({ verified: true }).eq('id', orgId)
  if (error) throw error
}

export async function deleteOrganization(orgId) {
  const { error } = await supabase.from('organizations').delete().eq('id', orgId)
  if (error) throw error
}

// Admin-only: every org on the platform (not just pending), newest first,
// with how many listings each has posted — powers the admin "All
// organizations" list, which links to fetchOrgAdminDetail for the full picture.
export async function fetchAllOrganizationsForAdmin() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*, opportunities(id)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({ ...mapOrg(row), listingCount: row.opportunities?.length ?? 0 }))
}

// Admin-only: one org's full picture — its info plus every listing it's
// posted, each with signups and hours logged. Powers /admin/orgs/:id.
export async function fetchOrgAdminDetail(orgId) {
  const { data: orgRow, error: orgErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle()
  if (orgErr) throw orgErr
  if (!orgRow) return null

  const { data: opps, error: oppErr } = await supabase
    .from('opportunities')
    .select(`${ADMIN_OPP_PREVIEW}, external_url`)
    .eq('org_id', orgId)
    .order('starts_at', { ascending: false })
  if (oppErr) throw oppErr

  const oppIds = (opps ?? []).map((o) => o.id)
  let signupCounts = {}
  let hourTotals = {}
  if (oppIds.length > 0) {
    const [{ data: signups }, { data: logs }] = await Promise.all([
      supabase.from('signups').select('opportunity_id').in('opportunity_id', oppIds),
      supabase.from('hour_logs').select('opportunity_id, hours').in('opportunity_id', oppIds),
    ])
    ;(signups ?? []).forEach((s) => {
      signupCounts[s.opportunity_id] = (signupCounts[s.opportunity_id] ?? 0) + 1
    })
    ;(logs ?? []).forEach((l) => {
      hourTotals[l.opportunity_id] = (hourTotals[l.opportunity_id] ?? 0) + Number(l.hours)
    })
  }

  const listings = (opps ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    category: o.category,
    description: o.description,
    startsAt: o.starts_at,
    durationHours: Number(o.duration_hours),
    isOngoing: o.is_ongoing,
    isOnline: o.is_online,
    isExternal: !!o.external_url,
    capacity: o.capacity,
    minAge: o.min_age,
    tags: o.tags ?? [],
    city: o.city,
    state: o.state,
    signupCount: signupCounts[o.id] ?? 0,
    hoursLogged: hourTotals[o.id] ?? 0,
  }))

  return { org: mapOrg(orgRow), listings }
}

// Admin-only: platform-wide totals for a simple overview block. Everything
// computed client-side from small aggregate queries, same philosophy as
// buildVaultData/buildLeaderboards — no separate reporting infra.
export async function fetchPlatformStats() {
  const [
    { count: volunteerCount },
    { count: orgCount },
    { count: listingCount },
    { count: signupCount },
    { data: hourRows },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }),
    supabase.from('signups').select('id', { count: 'exact', head: true }),
    supabase.from('hour_logs').select('hours, served_on, status'),
  ])

  const verifiedHours = (hourRows ?? [])
    .filter(isLogVerified)
    .reduce((sum, l) => sum + Number(l.hours), 0)

  return {
    volunteerCount: volunteerCount ?? 0,
    orgCount: orgCount ?? 0,
    listingCount: listingCount ?? 0,
    signupCount: signupCount ?? 0,
    verifiedHours: Math.round(verifiedHours),
  }
}

export async function fetchPendingSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((s) => ({
    id: s.id,
    orgName: s.org_name,
    website: s.website,
    notes: s.notes,
    city: s.city,
    state: s.state,
    submitterEmail: s.submitter_email,
    createdAt: s.created_at,
  }))
}

export async function updateSuggestionStatus(id, status) {
  const { error } = await supabase.from('suggestions').update({ status }).eq('id', id)
  if (error) throw error
}

export async function fetchHourLogs(userId) {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities(title, category, organizations(id, name, submitted_by))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Lighter than fetchHourLogs — just enough columns to compute a streak, for
// the Browse sidebar teaser.
export async function fetchMyStreak(userId) {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('served_on, status, created_at')
    .eq('user_id', userId)
  if (error) throw error
  return computeStreakWeeks(data ?? [])
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
// profiles, so names come from a second query. A volunteer can have several
// hour_logs rows for one opportunity now (one per dated session), so we sum
// them for a read-only "hours logged so far" chip — no verify action here.
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
      .select('user_id, hours')
      .eq('opportunity_id', opportunityId),
  ])
  const byId = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const totalsByUser = {}
  const entriesByUser = {}
  ;(logs ?? []).forEach((l) => {
    totalsByUser[l.user_id] = (totalsByUser[l.user_id] ?? 0) + Number(l.hours)
    entriesByUser[l.user_id] = (entriesByUser[l.user_id] ?? 0) + 1
  })
  return signups.map((s) => ({
    id: s.id,
    userId: s.user_id,
    status: s.status,
    displayName: byId[s.user_id]?.display_name ?? 'Volunteer',
    username: byId[s.user_id]?.username ?? '',
    hourLogTotal: totalsByUser[s.user_id] ?? 0,
    entryCount: entriesByUser[s.user_id] ?? 0,
  }))
}

function mapHourLog(row) {
  return {
    id: row.id,
    hours: Number(row.hours),
    servedOn: row.served_on,
    createdAt: row.created_at,
  }
}

// Everything the signed-in user has self-logged for one opportunity, most
// recently served first.
export async function fetchMyHourLogsForOpportunity(userId, opportunityId) {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('id, hours, served_on, created_at')
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)
    .order('served_on', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapHourLog)
}

// Self-reported honor-system log: the volunteer picks a date served (past or
// future) and how many hours, and pledges it's accurate. It shows as
// verified once served_on has passed — computed at read time, nothing to
// flip here. RLS requires pledge_ack = true.
export async function logHours({ userId, opportunityId, hours, servedOn }) {
  const { data, error } = await supabase
    .from('hour_logs')
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      hours: Number(hours),
      served_on: servedOn,
      pledge_ack: true,
    })
    .select('id, hours, served_on, created_at')
    .single()
  if (error) throw error
  return mapHourLog(data)
}

export async function updateHourLog(logId, { hours, servedOn }) {
  const { data, error } = await supabase
    .from('hour_logs')
    .update({ hours: Number(hours), served_on: servedOn, pledge_ack: true })
    .eq('id', logId)
    .select('id, hours, served_on, created_at')
    .single()
  if (error) throw error
  return mapHourLog(data)
}

export async function deleteHourLog(logId) {
  const { error } = await supabase.from('hour_logs').delete().eq('id', logId)
  if (error) throw error
}

const HOUR_MILESTONES = [
  { id: 'first-shift', label: 'First shift', targetHours: 0 },
  { id: '5-hours', label: '5 hours', targetHours: 5 },
  { id: '10-hours', label: '10 hours', targetHours: 10 },
  { id: '25-hours', label: '25 hours', targetHours: 25 },
  { id: '50-hours', label: '50 hours', targetHours: 50 },
  { id: '100-hours', label: '100 hours', targetHours: 100 },
  { id: '250-hours', label: '250 hours', targetHours: 250 },
]
const STREAK_MILESTONES = [3, 8, 12]

// Turns a raw profile + hour logs into everything VaultView/Certificate/
// leaderboards render: stats, badges, cause breakdown, hour-by-date
// breakdown, and the activity list. Every stat here is derived only from
// *verified* logs (served_on has passed) so nothing — badges, streaks,
// causes — can be inflated by logging hours for a date that hasn't happened
// yet; those still show up honestly as "scheduled" rather than being hidden.
export function buildVaultData(profileRow, hourLogRows) {
  const logs = hourLogRows ?? []
  const verifiedLogs = logs.filter(isLogVerified)
  const verifiedHours = verifiedLogs.reduce((sum, l) => sum + Number(l.hours), 0)
  const totalHours = logs.reduce((sum, l) => sum + Number(l.hours), 0)
  const scheduledHours = Math.max(0, totalHours - verifiedHours)

  const causeMap = {}
  verifiedLogs.forEach((l) => {
    const cat = l.opportunities?.category
    if (!cat) return
    causeMap[cat] = (causeMap[cat] ?? 0) + Number(l.hours)
  })
  const causes = Object.entries(causeMap)
    .map(([category, hours]) => ({ category, hours }))
    .sort((a, b) => b.hours - a.hours)

  const streakWeeks = computeStreakWeeks(logs)

  // Hour milestones: earned + only the next locked one, like the wireframe.
  const milestoneBadges = HOUR_MILESTONES.map((m) => ({
    id: m.id,
    label: m.label,
    earned: m.targetHours === 0 ? verifiedLogs.length > 0 : verifiedHours >= m.targetHours,
    // "First shift" has no hour target, so it never shows an "N hrs to go"
    // subtext — only the numeric milestones do.
    progressHours: m.targetHours === 0 ? null : verifiedHours,
    targetHours: m.targetHours === 0 ? null : m.targetHours,
  }))
  const nextLockedMilestone = milestoneBadges.find((b) => !b.earned)
  const milestoneShelf = milestoneBadges
    .filter((b) => b.earned)
    .concat(nextLockedMilestone ? [nextLockedMilestone] : [])

  // Cause badges: earned-only, no locked placeholder (too many causes to
  // tease them all) — 10+ verified hours in a category earns its badge.
  const causeBadges = causes
    .filter((c) => c.hours >= 10)
    .map((c) => {
      const copy = getCauseBadgeCopy(c.category)
      return { id: `cause-${c.category}`, label: copy.label, earned: true }
    })

  const streakBadges = STREAK_MILESTONES.filter((w) => streakWeeks >= w).map((w) => ({
    id: `streak-${w}`,
    label: `${w}-week streak`,
    earned: true,
  }))

  const distinctOrgs = new Set(
    verifiedLogs.map((l) => l.opportunities?.organizations?.id).filter(Boolean),
  )
  const hasCommunityHours = verifiedLogs.some((l) => l.opportunities?.organizations?.submitted_by)
  const communityBadges = [
    distinctOrgs.size >= 3 ? { id: 'explorer', label: 'Explorer', earned: true } : null,
    hasCommunityHours ? { id: 'community-champion', label: 'Community champion', earned: true } : null,
  ].filter(Boolean)

  const activeChallenge = getActiveChallenge()
  const challengeProgress = activeChallenge ? computeChallengeProgress(activeChallenge, logs) : null
  const challengeBadge =
    activeChallenge && challengeProgress?.complete
      ? [{ id: `challenge-${activeChallenge.id}`, label: activeChallenge.badgeLabel, earned: true }]
      : []

  const badges = [...milestoneShelf, ...causeBadges, ...streakBadges, ...communityBadges, ...challengeBadge]

  const activity = logs.map((l) => ({
    id: l.id,
    opportunityId: l.opportunity_id,
    title: l.opportunities?.title ?? 'Logged hours',
    orgName: l.opportunities?.organizations?.name ?? '',
    date: logDate(l),
    hours: Number(l.hours),
    status: isLogVerified(l) ? 'verified' : 'pending',
  }))

  // Hour breakdown by date served — verified hours only, one entry per day.
  const dateTotals = {}
  verifiedLogs.forEach((l) => {
    const day = logDate(l).slice(0, 10)
    dateTotals[day] = (dateTotals[day] ?? 0) + Number(l.hours)
  })
  const servedDates = Object.entries(dateTotals)
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  return {
    user: {
      id: profileRow.id,
      username: profileRow.username,
      displayName: profileRow.display_name,
      school: profileRow.school,
      gradYear: profileRow.grad_year,
      avatarUrl: profileRow.avatar_url,
      verifiedHours,
      scheduledHours,
      streakWeeks,
      causes,
      badges,
      activeChallenge,
      challengeProgress,
      servedDates,
      datesServedCount: servedDates.length,
      firstShiftDate: servedDates[0]?.date ?? null,
      mostRecentDate: servedDates[servedDates.length - 1]?.date ?? null,
    },
    activity,
  }
}

// ---- leaderboards (individual competition, several topics) ----
// hour_logs and profiles are both public-read, so — like buildVaultData —
// this fetches raw rows and computes every ranking client-side. Two
// queries because hour_logs has no direct FK to profiles (same reason
// fetchListingSignups already does a two-step lookup).
export async function fetchLeaderboardData() {
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

function monthStartStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function rankEntries(entries) {
  return entries
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

// Returns { allTime, thisMonth, streak, byCategory } — each a ranked array
// except byCategory, which is { [categoryId]: rankedArray }. All rankings
// are built from verified hours only, same rule as buildVaultData.
export function buildLeaderboards(rows, profiles) {
  const byProfile = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const byUser = {}
  ;(rows ?? []).forEach((r) => {
    ;(byUser[r.user_id] ??= []).push(r)
  })

  const monthStart = monthStartStr()
  const allTimeEntries = []
  const monthEntries = []
  const streakEntries = []
  const categoryTotals = {} // categoryId -> { userId -> hours }

  Object.entries(byUser).forEach(([userId, logs]) => {
    const profile = byProfile[userId]
    if (!profile) return
    const verified = logs.filter(isLogVerified)
    const allTimeHours = verified.reduce((s, l) => s + Number(l.hours), 0)
    const monthHours = verified
      .filter((l) => logDate(l).slice(0, 10) >= monthStart)
      .reduce((s, l) => s + Number(l.hours), 0)
    const streakWeeks = computeStreakWeeks(logs)

    const base = {
      userId,
      username: profile.username,
      displayName: profile.display_name,
      school: profile.school,
    }
    if (allTimeHours > 0) allTimeEntries.push({ ...base, value: allTimeHours })
    if (monthHours > 0) monthEntries.push({ ...base, value: monthHours })
    if (streakWeeks > 0) streakEntries.push({ ...base, value: streakWeeks })

    verified.forEach((l) => {
      const cat = l.opportunities?.category
      if (!cat) return
      const totals = (categoryTotals[cat] ??= {})
      totals[userId] = (totals[userId] ?? 0) + Number(l.hours)
    })
  })

  const byCategory = Object.fromEntries(
    Object.entries(categoryTotals).map(([cat, totals]) => [
      cat,
      rankEntries(
        Object.entries(totals).map(([userId, value]) => {
          const profile = byProfile[userId]
          return {
            userId,
            username: profile?.username,
            displayName: profile?.display_name,
            school: profile?.school,
            value,
          }
        }),
      ),
    ]),
  )

  return {
    allTime: rankEntries(allTimeEntries),
    thisMonth: rankEntries(monthEntries),
    streak: rankEntries(streakEntries),
    byCategory,
  }
}

export async function fetchMyOrganization(userId) {
  const { data } = await supabase.from('organizations').select('*').eq('owner_id', userId).maybeSingle()
  return mapOrg(data)
}

export async function createOrganization(userId, { name, location, contactEmail, contactPhone }) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      owner_id: userId,
      name,
      location,
      contact_email: contactEmail?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return mapOrg(data)
}

// A volunteer quick-adding a place they know, distinct from createOrganization:
// submitted_by tracks who flagged it without making them its dashboard owner,
// so it never collides with a real org account (see migration 023).
export async function createCommunityOrg(userId, { name, location, website, contactEmail, contactPhone }) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      submitted_by: userId,
      name,
      location,
      website: website || null,
      contact_email: contactEmail?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return mapOrg(data)
}

export async function updateOrganization(orgId, { name, description, website, contactEmail, contactPhone, logoUrl }) {
  const patch = {
    description: description?.trim() || null,
    website: website?.trim() || null,
    contact_email: contactEmail?.trim() || null,
    contact_phone: contactPhone?.trim() || null,
  }
  // name/logoUrl are optional args so callers that don't manage them (e.g.
  // the admin note editor never touches this function) can't blank them out.
  if (name !== undefined) patch.name = name.trim()
  if (logoUrl !== undefined) patch.logo_url = logoUrl?.trim() || null
  const { data, error } = await supabase.from('organizations').update(patch).eq('id', orgId).select().single()
  if (error) throw error
  return mapOrg(data)
}

// Every volunteer who's touched any of this org's listings (RSVP'd and/or
// logged hours), deduped by person, with their total hours and which
// listings — powers the org dashboard's Volunteers tab. RLS: hour_logs is
// public, and signups already lets an org owner read signups on their own
// listings (see "org owner reads listing signups").
export async function fetchOrgVolunteers(orgId) {
  const { data: opps, error: oppErr } = await supabase
    .from('opportunities')
    .select('id, title')
    .eq('org_id', orgId)
  if (oppErr) throw oppErr
  const oppIds = (opps ?? []).map((o) => o.id)
  if (oppIds.length === 0) return []
  const titleById = Object.fromEntries((opps ?? []).map((o) => [o.id, o.title]))

  const [{ data: signups, error: signupErr }, { data: logs, error: logErr }] = await Promise.all([
    supabase.from('signups').select('user_id, opportunity_id').in('opportunity_id', oppIds),
    supabase.from('hour_logs').select('user_id, opportunity_id, hours').in('opportunity_id', oppIds),
  ])
  if (signupErr) throw signupErr
  if (logErr) throw logErr

  const byUser = {}
  function touch(userId, opportunityId) {
    byUser[userId] ??= { userId, listings: new Set(), hours: 0 }
    byUser[userId].listings.add(titleById[opportunityId])
  }
  ;(signups ?? []).forEach((s) => touch(s.user_id, s.opportunity_id))
  ;(logs ?? []).forEach((l) => {
    touch(l.user_id, l.opportunity_id)
    byUser[l.user_id].hours += Number(l.hours)
  })

  const userIds = Object.keys(byUser)
  if (userIds.length === 0) return []
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', userIds)
  if (profileErr) throw profileErr
  const profileById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return Object.values(byUser)
    .map((v) => ({
      userId: v.userId,
      displayName: profileById[v.userId]?.display_name ?? 'Volunteer',
      username: profileById[v.userId]?.username ?? '',
      listings: [...v.listings],
      hours: Math.round(v.hours * 100) / 100,
    }))
    .sort((a, b) => b.hours - a.hours)
}

// Admin-only write (RLS: "admins manage any org"). Pass note: '' to clear it.
export async function adminSetOrgNote(orgId, note) {
  const { error } = await supabase
    .from('organizations')
    .update({ admin_note: note?.trim() || null })
    .eq('id', orgId)
  if (error) throw error
}

export async function fetchOrgOpportunities(orgId) {
  const [{ data, error }, counts] = await Promise.all([
    supabase.from('opportunities').select(OPP_SELECT).eq('org_id', orgId).order('starts_at'),
    fetchSignupCounts(),
  ])
  if (error) throw error
  return (data ?? []).map((row) => mapOpportunity(row, counts))
}

// A community organizer's posts each get their own org row (see
// createCommunityOrg), so this spans every org they've submitted_by, not
// just one — that's the "manage what you posted" list on /community.
export async function fetchMyCommunityPosts(userId) {
  const [{ data, error }, counts] = await Promise.all([
    supabase
      .from('opportunities')
      .select(OPP_SELECT)
      .eq('organizations.submitted_by', userId)
      .order('starts_at'),
    fetchSignupCounts(),
  ])
  if (error) throw error
  return (data ?? []).filter((row) => row.organizations).map((row) => mapOpportunity(row, counts))
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
    what_to_bring: draft.whatToBring?.trim() || null,
    tags: draft.tags ?? [],
  }))
  const { data, error } = await supabase.from('opportunities').insert(rows).select()
  if (error) throw error
  return (data ?? []).map((row) => mapOpportunity(row))
}
