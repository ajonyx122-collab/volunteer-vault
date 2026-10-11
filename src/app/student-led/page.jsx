import Link from 'next/link'
import { fetchStudentOrgsServer } from '../../lib/api.server'
import StudentLedTabs from '../../components/StudentLedTabs'
import StudentOrgCard from '../../components/StudentOrgCard'
import CommunityProjects from '../../components/CommunityProjects'

export const metadata = {
  title: 'Student-Led Nonprofits & Projects',
  description:
    'Volunteer with nonprofits founded by high school and college students, back their goals, and join community projects organized by students near you.',
  alternates: { canonical: '/student-led' },
}

export const revalidate = 300

export default async function StudentLedPage({ searchParams }) {
  const { tab } = await searchParams
  const orgs = await fetchStudentOrgsServer().catch(() => [])
  // Verified first, then newest — pending ones still show (honestly badged).
  const sorted = [...orgs].sort((a, b) => Number(b.verified) - Number(a.verified))

  const nonprofits = (
    <div className="mt-6">
      <p className="text-brand-green/60">
        Nonprofits started by high school and college students (and recent grads who started them in
        school). Volunteer with them, share them, or chip in toward their goals.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sorted.map((org) => (
          <StudentOrgCard key={org.id} org={org} />
        ))}
        {sorted.length === 0 && (
          <div className="rounded-card border border-dashed border-card-border bg-card p-8 text-center shadow-card sm:col-span-2">
            <p className="text-4xl">🎓</p>
            <p className="mt-2 font-display font-bold text-brand-green">The first student founders are setting up now.</p>
            <p className="mt-1 text-sm text-brand-green/60">Started a nonprofit? Be one of the first listed.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-card bg-brand-green p-6 text-cream-text shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-extrabold">Started a nonprofit as a student?</p>
          <p className="mt-1 text-sm text-cream-muted">
            Get your own page with your mission, a goal tracker, your volunteer opportunities, and a
            donate button. Free, always.
          </p>
        </div>
        <Link
          href="/dashboard?founder=1"
          className="shrink-0 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
        >
          List your nonprofit
        </Link>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-sticker font-display text-4xl font-extrabold">Student-Led</h1>
      <p className="mt-1 text-brand-green/70">
        Students aren't just showing up — they're starting things. Back the people your age who are
        building something.
      </p>
      <StudentLedTabs initialTab={tab} nonprofits={nonprofits} projects={<CommunityProjects />} />
    </div>
  )
}
