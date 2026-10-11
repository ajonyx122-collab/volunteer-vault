import Link from 'next/link'
import { fetchOpportunitiesServer } from '../../lib/api.server'
import { buildCauseDirectory, buildLocationDirectory, isRemote } from '../../lib/opportunityFilters'
import { breadcrumbJsonLd } from '../../lib/jsonLd'
import { CATEGORY_STYLES } from '../../components/categoryStyles'
import Breadcrumb from '../../components/Breadcrumb'
import FunHero, { Squiggle } from '../../components/FunHero'
import SectionTitle from '../../components/SectionTitle'
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
  return [...byState.values()].sort((a, b) => a.label.localeCompare(b.label))
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
      />

      <FunHero
        size="sm"
        eyebrow="📍 By cause & city"
        title={
          <>
            Find volunteer opportunities <Squiggle>near you</Squiggle>
          </>
        }
        subtitle="Real service hours for high school and college students. Pick a cause or your city to get started — RSVP free."
        badges={[
          { e: '🗺️', bg: 'bg-category-music-bg' },
          { e: '🌱', bg: 'bg-category-environment-bg' },
          { e: '🏙️', bg: 'bg-category-food-bg' },
          { e: '🐾', bg: 'bg-category-animals-bg' },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <Breadcrumb items={trail} />

      <section className="mt-8">
        <SectionTitle kicker="What do you care about?" title="Browse by cause" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {causes.map((c) => (
            <Link
              key={c.slug}
              href={`/volunteer/${c.slug}`}
              className="group flex items-center gap-2.5 rounded-card border-2 border-brand-green bg-card p-3 shadow-pop-soft transition-all hover:-translate-y-1 hover:shadow-pop sm:p-4"
            >
              <span
                className={`flex h-9 w-9 shrink-0 -rotate-6 items-center justify-center rounded-2xl text-xl transition-transform sm:h-11 sm:w-11 sm:text-2xl group-hover:rotate-6 group-hover:scale-110 ${
                  CATEGORY_STYLES[c.id]?.chip ?? 'bg-cream'
                }`}
              >
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-bold leading-tight text-brand-green sm:text-base">
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

      <section className="mt-14">
        <SectionTitle
          kicker="Where are you?"
          title="Browse by state"
          blurb="Pick your state to see its cities — or volunteer online from anywhere."
        />
        {stateGroups.length === 0 && onlineCount === 0 ? (
          <p className="mt-4 text-brand-green/60">No local listings yet — check back soon.</p>
        ) : (
          <StateExplorer groups={stateGroups} onlineCount={onlineCount} />
        )}
      </section>
      </div>
    </div>
  )
}
