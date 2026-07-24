'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '../data/mockData'
import { fetchHourLogs } from '../lib/api'
import { getActiveChallenge } from '../data/challenges'
import { computeChallengeProgress } from '../lib/challenges'
import { useAuth } from '../lib/AuthContext'
import CategoryChip from './CategoryChip'
import OpportunityCard from './OpportunityCard'
import StatPill from './StatPill'
import ChallengeBanner from './ChallengeBanner'

const MEDALS = ['🥇', '🥈', '🥉']

const isRemote = (o) => o.remote || o.isOnline || o.org?.remote
const minAgeOf = (o) => o.minAge ?? o.org?.minAge ?? 0

// Seeded with opportunities/topVolunteers fetched server-side (see
// app/page.jsx) so the listing content is present in the initial HTML for
// SEO — only the challenge banner (needs the logged-in user) fetches
// client-side, and the search form is interactive by nature.
export default function HomeView({ opportunities, topVolunteers }) {
  const { user } = useAuth()
  const [interest, setInterest] = useState('')
  const [location, setLocation] = useState('')
  const [challengeProgress, setChallengeProgress] = useState(null)
  const router = useRouter()
  const activeChallenge = getActiveChallenge()

  useEffect(() => {
    if (!user || !activeChallenge) return
    fetchHourLogs(user.id)
      .then((logs) => setChallengeProgress(computeChallengeProgress(activeChallenge, logs)))
      .catch(() => setChallengeProgress(null))
  }, [user, activeChallenge])

  const featured = opportunities.filter((o) => o.org?.featured).slice(0, 4)
  const highSchool = opportunities.filter((o) => minAgeOf(o) <= 14).slice(0, 4)
  const remote = opportunities.filter(isRemote).slice(0, 4)

  // Real, honest counts derived from what's actually in the directory.
  const orgCount = new Set(opportunities.map((o) => o.orgId)).size
  const remoteCount = opportunities.filter(isRemote).length
  const causeCount = new Set(opportunities.map((o) => o.category)).size

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (interest) params.set('q', interest)
    if (location) params.set('loc', location)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-green">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="font-display text-4xl font-extrabold text-cream-text sm:text-6xl">
            <span className="squiggle">Unlock</span> your community.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream-muted">
            Your people are already out here. Come find them — find opportunities, log your
            hours, and build a service record that colleges and employers can trust.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-card bg-card p-2 shadow-soft sm:flex-row"
          >
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="What are you into? (animals, art, cleanups...)"
              className="flex-1 rounded-pill border-none px-4 py-3 text-sm text-brand-green outline-none placeholder:text-brand-green/50"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Near you"
              className="rounded-pill border-none px-4 py-3 text-sm text-brand-green outline-none placeholder:text-brand-green/50 sm:w-40"
            />
            <button
              type="submit"
              className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
            >
              Find it
            </button>
          </form>

          {orgCount > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <StatPill value={orgCount} label="organizations" tone="dark" />
              <StatPill value={remoteCount} label="you can do remotely" tone="dark" />
              <StatPill value={causeCount} label="causes to explore" tone="dark" />
            </div>
          )}
        </div>
      </section>

      {activeChallenge && (
        <section className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
          <ChallengeBanner challenge={activeChallenge} progress={user ? challengeProgress : null} />
        </section>
      )}

      {/* Category chips */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} {...c} />
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <OppSection title="Featured" blurb="Hand-picked, well-known organizations recruiting right now.">
          {featured}
        </OppSection>
      )}

      {/* Great for high school students */}
      {highSchool.length > 0 && (
        <OppSection
          title="Great for high school students"
          blurb="Open to volunteers 14 and under — perfect for service hours."
        >
          {highSchool}
        </OppSection>
      )}

      {/* Remote opportunities */}
      {remote.length > 0 && (
        <OppSection title="Remote opportunities" blurb="Make an impact from your couch — no car required.">
          {remote}
        </OppSection>
      )}

      {/* Your vault = your proof */}
      <section className="bg-brand-green">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:flex-row md:text-left">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-extrabold text-cream-text">
              Your vault = your proof.
            </h2>
            <p className="mt-3 max-w-md text-cream-muted">
              Every verified hour lands in your public vault — a shareable link colleges,
              scholarships, and employers can trust. No spreadsheets, no guessing.
            </p>
            <Link
              href="/profile"
              className="mt-6 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
            >
              volunteervault.org/u/you
            </Link>
          </div>
          <div className="flex flex-1 flex-wrap justify-center gap-3">
            <StatPill value="✓" label="verified hours" tone="dark" />
            <StatPill value="🔥" label="weekly streaks" tone="dark" />
            <StatPill value="🏅" label="badges you earn" tone="dark" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-extrabold text-brand-green">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', title: 'Find it', body: 'Browse opportunities by interest and location — see who\'s already going.' },
            { step: '2', title: 'Log it', body: 'Show up, then log your own hours — honor system, no scanning or codes needed.' },
            { step: '3', title: 'Vault it', body: 'Once the date passes, it\'s verified and lands straight in your shareable vault.' },
          ].map((s) => (
            <div key={s.step} className="rounded-card border border-card-border bg-card p-6 text-center shadow-card">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-coral font-display font-extrabold text-cream-text">
                {s.step}
              </div>
              <h3 className="font-display font-bold text-brand-green">{s.title}</h3>
              <p className="mt-1 text-sm text-brand-green/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboards preview */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-card border border-card-border bg-card p-8 text-center shadow-card sm:p-10">
          <p className="text-4xl">🏆</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-brand-green">
            Top volunteers this season
          </h2>
          <p className="mx-auto mt-2 max-w-md text-brand-green/70">
            Real verified hours, ranked. Log yours and climb the board.
          </p>

          {topVolunteers.length > 0 ? (
            <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
              {topVolunteers.map((v) => (
                <div
                  key={v.userId}
                  className="flex items-center gap-3 rounded-card border border-card-border bg-cream p-3 text-left"
                >
                  <span className="w-7 shrink-0 text-center text-xl">{MEDALS[v.rank - 1]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-green">{v.displayName}</p>
                    {v.school && <p className="truncate text-xs text-brand-green/50">{v.school}</p>}
                  </div>
                  <p className="shrink-0 font-display font-extrabold text-brand-green">{v.value} hrs</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-4 max-w-md text-sm text-brand-green/60">
              No board yet — log the first hours and claim the top spot.
            </p>
          )}

          <Link
            href="/leaderboards"
            className="mt-6 inline-block rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
          >
            See full leaderboards
          </Link>
        </div>
      </section>

      {/* Org CTA */}
      <section id="org-cta" className="bg-gold">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <h2 className="font-display text-xl font-extrabold text-gold-text">
              Running an org? Post your opportunities free.
            </h2>
            <p className="mt-1 text-sm text-gold-text/80">
              Reach students actively looking for verified service hours.
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
          >
            List an opportunity
          </Link>
        </div>
      </section>
    </div>
  )
}

function OppSection({ title, blurb, children }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-brand-green">{title}</h2>
          <p className="text-sm text-brand-green/60">{blurb}</p>
        </div>
        <Link href="/browse" className="shrink-0 text-sm font-bold text-coral hover:underline">
          See all
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {children.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
        ))}
      </div>
    </section>
  )
}
