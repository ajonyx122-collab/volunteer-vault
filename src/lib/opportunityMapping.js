// Shared, client/server-agnostic mapping between Supabase's snake_case rows
// and the camelCase shape components consume. Split out from api.js so
// api.server.js (Server Components) and api.js (client components) can both
// use the exact same mapping without duplicating it.

export function mapOrg(row) {
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
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    // Only present when the caller explicitly selected it (owner's own
    // dashboard fetch, admin queries) — never included in the public
    // opportunities join, see OPP_SELECT below.
    adminNote: row.admin_note,
    ownerId: row.owner_id,
    submittedBy: row.submitted_by,
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

export function mapOpportunity(row, counts = {}) {
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
    whatToBring: row.what_to_bring ?? null,
    distanceMiles: null, // needs geo, Phase 3 map work
    org: mapOrg(row.organizations),
  }
}

export function mapReview(row) {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    userId: row.user_id,
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

// Explicit org column list (not organizations(*)) so admin_note never rides
// along on the public opportunities feed — see mapOrg's note on adminNote.
export const ORG_COLUMNS =
  'id, name, verified, description, location, logo_url, image_url, website, contact_email, contact_phone, owner_id, submitted_by, category, remote, international, min_age, country, state, city, counts_for_service_hours, commitment_type, featured'
export const OPP_SELECT = `*, organizations(${ORG_COLUMNS}), reviews(rating_organized, rating_welcoming, rating_impactful, quote)`
