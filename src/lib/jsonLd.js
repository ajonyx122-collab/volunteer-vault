// JSON-LD structured data builders for SEO rich results (Phase 0.3).
//
// We emit schema.org/Event for opportunity pages: Google renders Event rich
// results in search, and the opportunity shape (title, date, place, organizer,
// free "offer") maps onto Event cleanly. A bare schema.org/VolunteerOpportunity
// has no documented Google rich result, so Event is the indexable choice.
//
// These builders are pure and defensive: they only include fields that are
// present, and opportunityEventJsonLd returns null when the listing lacks a
// concrete start date (Event without startDate is invalid and Google warns on
// it), so callers can conditionally render the <script> tag.

import { getCategoryMeta } from '../data/mockData'
import { opportunityPath } from './opportunityUrls'

const SITE_URL = 'https://volunteervault.org'

// Absolute canonical URL for an opportunity (descriptive once it has a slug,
// legacy /opportunities/<id> until the slug migration lands).
export function opportunityUrl(opp) {
  return `${SITE_URL}${opportunityPath(opp)}`
}

// Best-effort ISO end time from start + duration (hours). Returns undefined if
// either input is missing or unparseable, so the field is simply omitted.
function computeEndDate(startsAt, durationHours) {
  if (!startsAt || !durationHours) return undefined
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return undefined
  const ms = Number(durationHours) * 60 * 60 * 1000
  if (!Number.isFinite(ms) || ms <= 0) return undefined
  return new Date(start.getTime() + ms).toISOString()
}

function buildLocation(opp) {
  if (opp.isOnline || opp.remote) {
    const url = opp.externalUrl || opp.signupLink || opportunityUrl(opp)
    return { '@type': 'VirtualLocation', url }
  }

  const address = {
    '@type': 'PostalAddress',
    ...(opp.address ? { streetAddress: opp.address } : {}),
    ...(opp.city ? { addressLocality: opp.city } : {}),
    ...(opp.state ? { addressRegion: opp.state } : {}),
    ...(opp.zip ? { postalCode: String(opp.zip) } : {}),
    addressCountry: 'US',
  }

  // A Place needs at least a name or an address to be meaningful. If we have
  // neither city nor street, fall back to the org name as the place name.
  const placeName =
    [opp.city, opp.state].filter(Boolean).join(', ') || opp.org?.name || 'In person'

  return { '@type': 'Place', name: placeName, address }
}

export function opportunityEventJsonLd(opp) {
  if (!opp || !opp.startsAt || opp.isOngoing) return null

  const start = new Date(opp.startsAt)
  if (Number.isNaN(start.getTime())) return null

  const category = getCategoryMeta(opp.category)
  const orgName = opp.org?.name
  const location = opp.isOnline
    ? 'Online'
    : [opp.city, opp.state].filter(Boolean).join(', ')
  const description = (
    opp.description?.trim() ||
    `${category?.label ?? 'Volunteer'} opportunity${orgName ? ` with ${orgName}` : ''}${
      location ? ` in ${location}` : ''
    } — RSVP free on VolunteerVault and log verified service hours.`
  ).slice(0, 5000)

  const url = opportunityUrl(opp)
  const endDate = computeEndDate(opp.startsAt, opp.durationHours)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: opp.title,
    description,
    startDate: start.toISOString(),
    ...(endDate ? { endDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      opp.isOnline || opp.remote
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location: buildLocation(opp),
    url,
    ...(opp.org?.imageUrl ? { image: [opp.org.imageUrl] } : {}),
    // Free to attend — models the "RSVP free" nature so Google shows $0.
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: opp.signupLink || opp.externalUrl || url,
      validFrom: start.toISOString(),
    },
  }

  if (orgName) {
    jsonLd.organizer = {
      '@type': 'Organization',
      name: orgName,
      ...(opp.org?.website ? { url: opp.org.website } : {}),
    }
  }

  return jsonLd
}

// Generic BreadcrumbList from [{ name, href }] items — the SAME array that
// feeds the visible <Breadcrumb> component, so the two never drift. `href` is
// a site-root relative path (e.g. '/browse'); the last item is the current page.
export function breadcrumbJsonLd(items) {
  if (!items?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.href}`,
    })),
  }
}
