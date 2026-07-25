import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchOpportunitiesServer } from '../../../lib/api.server'
import {
  buildCauseDirectory,
  buildLocationDirectory,
  resolveLandingSlug,
  opportunitiesForCause,
  opportunitiesForCity,
} from '../../../lib/opportunityFilters'
import { breadcrumbJsonLd } from '../../../lib/jsonLd'
import { CATEGORY_STYLES } from '../../../components/categoryStyles'
import Breadcrumb from '../../../components/Breadcrumb'
import OpportunityCard from '../../../components/OpportunityCard'

// Landing pages are SEO surfaces — regenerate periodically so new listings
// (and brand-new cities/causes, via dynamicParams) show up without a redeploy.
export const revalidate = 300

// Prebuild a page for every city/cause that currently has listings. Slugs not
// in this list still render on demand (dynamicParams defaults to true).
export async function generateStaticParams() {
  const opps = await fetchOpportunitiesServer().catch(() => [])
  const causes = buildCauseDirectory(opps).map((c) => ({ slug: c.slug }))
  const cities = buildLocationDirectory(opps).map((c) => ({ slug: c.slug }))
  return [...causes, ...cities]
}

// Copy builders — one place for the templated title/description/hero strings.
function causeCopy(cause, count) {
  return {
    title: `${cause.label} Volunteer Opportunities for Students`,
    description: `Find ${count} ${cause.label.toLowerCase()} volunteer ${
      count === 1 ? 'opportunity' : 'opportunities'
    } for high school and college students — RSVP free and log verified service hours on VolunteerVault.`,
    h1: `${cause.label} volunteer opportunities`,
    intro: `${cause.icon} ${count} ${cause.label.toLowerCase()} ${
      count === 1 ? 'way' : 'ways'
    } to earn real, verified service hours. Your people are already out here.`,
  }
}

function cityCopy(city, count) {
  return {
    title: `Volunteer Opportunities in ${city.label}`,
    description: `Find ${count} volunteer ${
      count === 1 ? 'opportunity' : 'opportunities'
    } in ${city.label} for high school and college students — filter by cause, RSVP free, and log verified service hours.`,
    h1: `Volunteer opportunities in ${city.label}`,
    intro: `📍 ${count} real ${
      count === 1 ? 'way' : 'ways'
    } for students to earn verified service hours in ${city.city}. RSVP free.`,
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const opps = await fetchOpportunitiesServer().catch(() => [])
  const resolved = resolveLandingSlug(slug, opps)
  if (!resolved) return { title: 'Not found' }

  const copy =
    resolved.type === 'cause'
      ? causeCopy(resolved.cause, opportunitiesForCause(opps, resolved.cause.id).length)
      : cityCopy(
          resolved.city,
          opportunitiesForCity(opps, resolved.city.city, resolved.city.state).length,
        )

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/volunteer/${slug}` },
    openGraph: { title: copy.title, description: copy.description, type: 'website' },
  }
}

// A row of pill links to other landing pages — the internal-link mesh that
// lets crawlers (and students) hop between cities and causes.
function ChipRow({ label, chips }) {
  if (!chips.length) return null
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-brand-green/50">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            className={`rounded-pill px-3 py-1.5 text-xs font-bold shadow-card transition-transform hover:scale-105 ${
              chip.className ?? 'bg-cream text-brand-green border border-card-border'
            }`}
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function VolunteerLandingPage({ params }) {
  const { slug } = await params
  const opps = await fetchOpportunitiesServer().catch(() => [])
  const resolved = resolveLandingSlug(slug, opps)
  if (!resolved) notFound()

  const causes = buildCauseDirectory(opps)
  const cities = buildLocationDirectory(opps)

  let listings
  let copy
  let browseHref
  let crossChips

  if (resolved.type === 'cause') {
    const { cause } = resolved
    listings = opportunitiesForCause(opps, cause.id)
    copy = causeCopy(cause, listings.length)
    browseHref = `/browse?category=${cause.id}`
    crossChips = [
      {
        label: 'Other causes',
        chips: causes
          .filter((c) => c.id !== cause.id)
          .slice(0, 12)
          .map((c) => ({
            href: `/volunteer/${c.slug}`,
            label: `${c.icon} ${c.label}`,
            className: CATEGORY_STYLES[c.id]?.chip,
          })),
      },
      {
        label: 'Popular cities',
        chips: cities.slice(0, 10).map((c) => ({
          href: `/volunteer/${c.slug}`,
          label: `📍 ${c.label}`,
        })),
      },
    ]
  } else {
    const { city } = resolved
    listings = opportunitiesForCity(opps, city.city, city.state)
    copy = cityCopy(city, listings.length)
    browseHref = '/browse'
    crossChips = [
      {
        label: 'Browse by cause',
        chips: causes.slice(0, 12).map((c) => ({
          href: `/volunteer/${c.slug}`,
          label: `${c.icon} ${c.label}`,
          className: CATEGORY_STYLES[c.id]?.chip,
        })),
      },
      {
        label: 'Other cities',
        chips: cities
          .filter((c) => c.slug !== city.slug)
          .slice(0, 10)
          .map((c) => ({ href: `/volunteer/${c.slug}`, label: `📍 ${c.label}` })),
      },
    ]
  }

  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Volunteer opportunities', href: '/volunteer' },
    { name: copy.h1, href: `/volunteer/${slug}` },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
      />

      <Breadcrumb items={trail} />

      <header className="mt-3">
        <h1 className="font-display text-3xl font-extrabold text-brand-green sm:text-4xl">
          {copy.h1}
        </h1>
        <p className="mt-2 max-w-2xl text-brand-green/70">{copy.intro}</p>
      </header>

      {crossChips.map((row) => (
        <ChipRow key={row.label} label={row.label} chips={row.chips} />
      ))}

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-brand-green/50">
            {listings.length} {listings.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
          <Link href={browseHref} className="text-sm font-bold text-coral hover:underline">
            Refine on browse →
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
            No listings here just yet — check back soon, or{' '}
            <Link href="/browse" className="font-bold text-coral hover:underline">
              browse everything
            </Link>
            .
          </p>
        ) : (
          listings.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />)
        )}
      </div>
    </div>
  )
}
