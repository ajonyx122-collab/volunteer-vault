// Shared metadata / breadcrumb / JSON-LD builders for an opportunity, used by
// BOTH the descriptive route (/volunteer/<city>/<org>/<slug>) and the legacy
// /opportunities/<id> route, so the two render identically and always point
// their canonical at the descriptive URL.

import { getCategoryMeta } from '../data/mockData'
import { citySlug, cityOf, stateOf, isRemote } from './opportunityFilters'
import { opportunityPath } from './opportunityUrls'
import { opportunityEventJsonLd, breadcrumbJsonLd } from './jsonLd'

export function buildOpportunityMetadata(opportunity) {
  const category = getCategoryMeta(opportunity.category)
  const orgName = opportunity.org?.name
  const location = opportunity.isOnline
    ? 'Online'
    : [opportunity.city, opportunity.state].filter(Boolean).join(', ')
  const description = (
    opportunity.description?.trim() ||
    `${category?.label ?? 'Volunteer'} opportunity${orgName ? ` with ${orgName}` : ''}${
      location ? ` in ${location}` : ''
    } — RSVP free on VolunteerVault and log verified service hours.`
  ).slice(0, 160)

  return {
    title: opportunity.title,
    description,
    alternates: { canonical: opportunityPath(opportunity) },
    openGraph: {
      title: opportunity.title,
      description,
      type: 'website',
      images: opportunity.org?.imageUrl ? [opportunity.org.imageUrl] : undefined,
    },
  }
}

// Breadcrumb trail that mirrors the URL hierarchy: Home → hub → the city
// landing (local listings) or cause landing (remote), → the listing itself.
export function buildOpportunityTrail(opportunity) {
  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Volunteer opportunities', href: '/volunteer' },
  ]
  const cSlug = citySlug(cityOf(opportunity), stateOf(opportunity))
  const category = getCategoryMeta(opportunity.category)
  if (cSlug && !isRemote(opportunity)) {
    trail.push({ name: `${cityOf(opportunity)}, ${stateOf(opportunity)}`, href: `/volunteer/${cSlug}` })
  } else if (category) {
    trail.push({ name: category.label, href: `/volunteer/${category.id}` })
  }
  trail.push({ name: opportunity.title, href: opportunityPath(opportunity) })
  return trail
}

export function buildOpportunityJsonLd(opportunity) {
  return {
    eventLd: opportunityEventJsonLd(opportunity),
    breadcrumbLd: breadcrumbJsonLd(buildOpportunityTrail(opportunity)),
  }
}
