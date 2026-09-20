import Link from 'next/link'
import { fetchOpportunitiesServer } from '../../lib/api.server'
import { buildCauseDirectory, buildLocationDirectory, isRemote } from '../../lib/opportunityFilters'
import { breadcrumbJsonLd } from '../../lib/jsonLd'
import { CATEGORY_STYLES } from '../../components/categoryStyles'
import Breadcrumb from '../../components/Breadcrumb'
import StateExplorer from '../../components/StateExplorer'

export const revalidate = 300

export const metadata = {
  title: 'Volunteer Opportunities for Students — Browse by Cause & City',
  description:
    'Browse real volunteer opportunities for high school and college students by cause and by city. RSVP free and build a verified record of your service hours.',
  alternates: { canonical: '/volunteer' },
}

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington, D.C.',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// Turn the flat, most-listings-first city list into groups by state so the
// section reads as tidy blocks instead of one long wall. States are ordered by
// total listings (Georgia leads), cities within a state by their own count.
function groupCitiesByState(cities) {
  const byState = new Map()
  for (const c of cities) {
    if (!byState.has(c.state))
      byState.set(c.state, { state: c.state, label: STATE_NAMES[c.state] ?? c.state, total: 0, cities: [] })
    const g = byState.get(c.state)
    g.cities.push(c)
    g.total += c.count
  }
  return [...byState.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
}

export default async function VolunteerHubPage() {
  const opps = await fetchOpportunitiesServer().catch(() => [])
  const causes = buildCauseDirectory(opps)
  const cities = buildLocationDirectory(opps)
  const stateGroups = groupCitiesByState(cities)
  const onlineCount = opps.filter(isRemote).length

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
        <h2 className="font-display text-xl font-extrabold text-brand-green">Browse by state</h2>
        <p className="mt-1 text-sm text-brand-green/60">
          Pick your state to see its cities — or volunteer online from anywhere.
        </p>
        {stateGroups.length === 0 && onlineCount === 0 ? (
          <p className="mt-4 text-brand-green/60">No local listings yet — check back soon.</p>
        ) : (
          <StateExplorer groups={stateGroups} onlineCount={onlineCount} />
        )}
      </section>
    </div>
  )
}
