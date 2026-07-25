import Link from 'next/link'
import { fetchOpportunitiesServer } from '../../lib/api.server'
import { buildCauseDirectory, buildLocationDirectory } from '../../lib/opportunityFilters'
import { breadcrumbJsonLd } from '../../lib/jsonLd'
import { CATEGORY_STYLES } from '../../components/categoryStyles'
import Breadcrumb from '../../components/Breadcrumb'

export const revalidate = 300

export const metadata = {
  title: 'Volunteer Opportunities for Students — Browse by Cause & City',
  description:
    'Browse real volunteer opportunities for high school and college students by cause and by city. RSVP free and build a verified record of your service hours.',
  alternates: { canonical: '/volunteer' },
}

export default async function VolunteerHubPage() {
  const opps = await fetchOpportunitiesServer().catch(() => [])
  const causes = buildCauseDirectory(opps)
  const cities = buildLocationDirectory(opps)

  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Volunteer opportunities', href: '/volunteer' },
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
          Find volunteer opportunities near you
        </h1>
        <p className="mt-2 max-w-2xl text-brand-green/70">
          Real, verified service hours for high school and college students. Pick a cause or your
          city to get started — RSVP free.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-brand-green">Browse by cause</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {causes.map((c) => (
            <Link
              key={c.slug}
              href={`/volunteer/${c.slug}`}
              className="flex items-center gap-3 rounded-card border border-card-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-pop"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card text-2xl ${
                  CATEGORY_STYLES[c.id]?.chip ?? 'bg-cream'
                }`}
              >
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display font-bold text-brand-green">
                  {c.label}
                </span>
                <span className="text-xs font-semibold text-brand-green/50">
                  {c.count} {c.count === 1 ? 'opportunity' : 'opportunities'}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-extrabold text-brand-green">Browse by city</h2>
        {cities.length === 0 ? (
          <p className="mt-4 text-brand-green/60">No local listings yet — check back soon.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/volunteer/${c.slug}`}
                className="rounded-pill border border-card-border bg-card px-4 py-2 text-sm font-bold text-brand-green shadow-card transition-transform hover:scale-105"
              >
                📍 {c.label}{' '}
                <span className="font-semibold text-brand-green/40">· {c.count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
