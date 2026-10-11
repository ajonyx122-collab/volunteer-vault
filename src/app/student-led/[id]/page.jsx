import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchStudentOrgServer } from '../../../lib/api.server'
import { breadcrumbJsonLd } from '../../../lib/jsonLd'
import { FOUNDER_STATUS_LABELS } from '../../../lib/opportunityMapping'
import Breadcrumb from '../../../components/Breadcrumb'
import OrgAvatar from '../../../components/OrgAvatar'
import VerifiedBadge from '../../../components/VerifiedBadge'
import GoalProgress from '../../../components/GoalProgress'
import OpportunityCard from '../../../components/OpportunityCard'
import ShareButton from '../../../components/ShareButton'

export const revalidate = 300

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Only ever link out to http(s) — never a javascript: or other scheme a
// founder might type into their donate/website field.
function safeUrl(raw) {
  if (!raw) return null
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

async function load(id) {
  if (!UUID.test(id)) return null
  return fetchStudentOrgServer(id).catch(() => null)
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const org = await load(id)
  if (!org) return { title: 'Nonprofit not found' }
  const description = (
    org.mission ||
    org.description ||
    `${org.name} is a student-founded nonprofit on VolunteerVault.`
  ).slice(0, 160)
  return {
    title: `${org.name} — Student-Led Nonprofit`,
    description,
    alternates: { canonical: `/student-led/${org.id}` },
    openGraph: { title: org.name, description },
  }
}

export default async function StudentOrgPage({ params }) {
  const { id } = await params
  const org = await load(id)
  if (!org) notFound()

  // Donate button only once an admin has verified the org.
  const donateUrl = org.verified ? safeUrl(org.donateUrl) : null
  const websiteUrl = safeUrl(org.website)
  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Student-Led', href: '/student-led' },
    { name: org.name, href: `/student-led/${org.id}` },
  ]
  const founderBits = [
    org.founderSchool,
    FOUNDER_STATUS_LABELS[org.founderStatus],
    org.foundedYear && `Started ${org.foundedYear}`,
  ].filter(Boolean)
  const opps = org.opportunities

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
      />
      <Breadcrumb items={trail} />

      <header className="mt-4 flex flex-wrap items-start gap-4">
        <OrgAvatar org={org} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold text-brand-green sm:text-4xl">{org.name}</h1>
            <VerifiedBadge verified={org.verified} />
          </div>
          <p className="mt-1 text-sm font-bold text-coral">
            🎓 Student-founded{org.founderName ? ` by ${org.founderName}` : ''}
          </p>
          {founderBits.length > 0 && <p className="text-sm text-brand-green/60">{founderBits.join(' · ')}</p>}
          {org.location && <p className="text-sm text-brand-green/60">📍 {org.location}</p>}
        </div>
      </header>

      {(org.mission || org.description) && (
        <p className="mt-6 text-lg leading-relaxed text-brand-green">{org.mission || org.description}</p>
      )}

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={org.impact?.hours ?? 0} label="Volunteer hours" />
        <Stat value={org.impact?.volunteers ?? 0} label="Volunteers" />
        <Stat value={org.impact?.rsvps ?? 0} label="RSVPs" />
        <Stat value={opps.length} label="Open opportunities" />
      </section>
      <p className="mt-1.5 text-[11px] text-brand-green/40">Counted automatically from activity on VolunteerVault.</p>

      {org.goalTitle && org.goalTarget ? (
        <section className="mt-8">
          <GoalProgress org={org} />
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold text-brand-green">Ways to help</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <HelpCard
            icon="🙋"
            title="Volunteer"
            body={opps.length ? 'Pick an opportunity below and hit Count me in.' : 'No open opportunities right now — check back soon.'}
          >
            {opps.length > 0 && (
              <a href="#opportunities" className="text-sm font-bold text-coral hover:underline">
                See opportunities ↓
              </a>
            )}
          </HelpCard>
          <HelpCard icon="📣" title="Spread the word" body="Send this page to a friend, your club, or your group chat.">
            <ShareButton title={org.name} />
          </HelpCard>
          {donateUrl && (
            <HelpCard
              icon="💛"
              title="Donate"
              body={`Donations go straight to ${org.name} through their own page — VolunteerVault never touches the money.`}
            >
              <a
                href={donateUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block rounded-pill bg-gold px-5 py-2 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg"
              >
                Donate ↗
              </a>
            </HelpCard>
          )}
          {websiteUrl && (
            <HelpCard icon="🌐" title="Learn more" body="Check out their website for the full story.">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm font-bold text-coral hover:underline"
              >
                Visit website ↗
              </a>
            </HelpCard>
          )}
        </div>
      </section>

      {org.founderStory && (
        <section className="mt-10 rounded-card bg-brand-green p-6 text-cream-text shadow-card">
          <h2 className="font-display text-xl font-extrabold">Why {org.founderName || 'the founder'} started it</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-cream-muted">{org.founderStory}</p>
        </section>
      )}

      <section id="opportunities" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-brand-green">Volunteer opportunities</h2>
        <div className="mt-4 flex flex-col gap-4">
          {opps.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}
          {opps.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-sm text-brand-green/60 shadow-card">
              Nothing open right now.
            </p>
          )}
        </div>
      </section>

      <p className="mt-10 text-center text-sm">
        <Link href="/student-led" className="font-bold text-coral hover:underline">
          ← More student-led nonprofits
        </Link>
      </p>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-4 text-center shadow-card">
      <p className="font-display text-2xl font-extrabold text-brand-green">{Number(value).toLocaleString()}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-green/50">{label}</p>
    </div>
  )
}

function HelpCard({ icon, title, body, children }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-card-border bg-card p-5 shadow-card">
      <p className="font-bold text-brand-green">
        {icon} {title}
      </p>
      <p className="text-sm text-brand-green/70">{body}</p>
      {children && <div className="mt-auto pt-1">{children}</div>}
    </div>
  )
}
