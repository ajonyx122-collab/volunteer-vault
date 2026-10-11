import Link from 'next/link'
import { fetchStudentOrgsServer } from '../../lib/api.server'
import StudentLedTabs from '../../components/StudentLedTabs'
import StudentOrgCard from '../../components/StudentOrgCard'
import CommunityProjects from '../../components/CommunityProjects'
import FunHero, { Squiggle } from '../../components/FunHero'
import Reveal from '../../components/Reveal'

export const metadata = {
  title: 'Student-Led Nonprofits & Projects',
  description:
    'Volunteer with nonprofits founded by high school and college students, back their goals, and join community projects organized by students near you.',
  alternates: { canonical: '/student-led' },
}

export const revalidate = 300

const FOUNDER_STEPS = [
  { icon: '🏁', title: 'Set it up', body: 'Name, city, and tick "I started this as a student."' },
  { icon: '✍️', title: 'Tell your story', body: 'Mission, a goal tracker, photos, and a donate link.' },
  { icon: '📈', title: 'Grow', body: 'Post opportunities — volunteers and hours count up automatically.' },
]

export default async function StudentLedPage({ searchParams }) {
  const { tab } = await searchParams
  const orgs = await fetchStudentOrgsServer().catch(() => [])
  // Verified first, then newest — pending ones still show (honestly badged).
  const sorted = [...orgs].sort((a, b) => Number(b.verified) - Number(a.verified))
  const totalHours = orgs.reduce((sum, o) => sum + (o.impact?.hours ?? 0), 0)

  const nonprofits = (
    <div className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {sorted.map((org, i) => (
          <Reveal key={org.id} delay={(i % 4) * 80}>
            <StudentOrgCard org={org} index={i} />
          </Reveal>
        ))}
        {sorted.length === 0 && (
          <div className="relative overflow-hidden rounded-card border-2 border-dashed border-brand-green/40 bg-card p-8 text-center sm:col-span-2 sm:p-10">
            <p className="animate-floaty inline-block text-6xl" style={{ '--tilt': '-6deg' }}>
              🚀
            </p>
            <p className="mt-3 font-display text-2xl font-extrabold text-brand-green">This wall is waiting for its first founder.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-green/60">
              Started something as a student? Grab the first spot — your page goes up the minute you create it.
            </p>
            <Link
              href="/dashboard?founder=1"
              className="mt-5 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg"
            >
              Be the first 🎉
            </Link>
          </div>
        )}
      </div>

      {/* Founder CTA */}
      <Reveal className="mt-12">
        <section className="relative overflow-hidden rounded-card border-2 border-brand-green bg-gold p-6 shadow-pop sm:p-8">
          <span className="pointer-events-none absolute -right-6 -top-8 rotate-12 text-[8rem] opacity-20" aria-hidden>
            🎓
          </span>
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold-text/70">For student founders</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-gold-text sm:text-3xl">
            Started a nonprofit? Get your own page.
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {FOUNDER_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3 rounded-card bg-card/80 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-lg">
                  {s.icon}
                </span>
                <div>
                  <p className="font-bold text-brand-green">
                    {i + 1}. {s.title}
                  </p>
                  <p className="text-xs text-brand-green/70">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/dashboard?founder=1"
            className="mt-6 inline-block w-full rounded-pill bg-brand-green px-6 py-3 text-center text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg sm:w-auto"
          >
            List your nonprofit — free →
          </Link>
        </section>
      </Reveal>
    </div>
  )

  return (
    <div>
      <FunHero
        eyebrow="🎓 Student-Led"
        title={
          <>
            Built by <Squiggle>students</Squiggle>, for everyone
          </>
        }
        subtitle="Students aren't just showing up — they're starting things. Volunteer with nonprofits founded by people your age, back their goals, or join a project near you."
        badges={[
          { e: '🚀', bg: 'bg-category-music-bg' },
          { e: '🌱', bg: 'bg-category-environment-bg' },
          { e: '💡', bg: 'bg-category-food-bg' },
          { e: '💛', bg: 'bg-category-art-bg' },
          { e: '🎓', bg: 'bg-category-animals-bg' },
          { e: '🤝', bg: 'bg-category-community-bg' },
        ]}
      >
        {orgs.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <HeroStat value={orgs.length} label={orgs.length === 1 ? 'student nonprofit' : 'student nonprofits'} />
            {totalHours > 0 && <HeroStat value={totalHours} label="volunteer hours" />}
          </div>
        ) : (
          // Before the first founders join, zeros would look sad — show the ways in instead.
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard?founder=1"
              className="w-full rounded-pill bg-gold px-7 py-3.5 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg sm:w-auto"
            >
              🎓 List your nonprofit
            </Link>
            <Link
              href="/student-led?tab=projects"
              className="w-full rounded-pill px-6 py-3 text-sm font-bold text-cream-text ring-2 ring-cream-text/40 transition-colors hover:bg-cream-text/10 sm:w-auto"
            >
              🌱 Browse projects
            </Link>
          </div>
        )}
      </FunHero>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <StudentLedTabs initialTab={tab} nonprofitCount={orgs.length} nonprofits={nonprofits} projects={<CommunityProjects />} />
      </div>
    </div>
  )
}

function HeroStat({ value, label }) {
  return (
    <span className="rounded-pill bg-cream-text/10 px-4 py-2 text-sm text-cream-muted ring-1 ring-cream-text/20">
      <span className="font-display text-lg font-extrabold text-gold">{Number(value).toLocaleString()}</span> {label}
    </span>
  )
}
