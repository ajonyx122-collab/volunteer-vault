'use client'

import { useEffect, useMemo, useState } from 'react'
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
import CountUp from './CountUp'
import Reveal from './Reveal'
import { opportunityPath } from '../lib/opportunityUrls'

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

  // Featured rotates daily so the homepage doesn't show the same four orgs
  // forever. The pool is every featured org (stable order by id); we advance a
  // window of four through it based on the day number, wrapping around. The
  // day number is derived from the date only, so the server HTML and the
  // client hydration compute the same set (no mismatch).
  const featured = useMemo(() => {
    const pool = opportunities
      .filter((o) => o.org?.featured)
      .sort((a, b) => a.orgId.localeCompare(b.orgId))
    if (pool.length <= 4) return pool
    const day = Math.floor(Date.now() / (24 * 3600 * 1000))
    const offset = day % pool.length
    return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 4)
  }, [opportunities])
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

  function surpriseMe() {
    if (!opportunities.length) return
    const pick = opportunities[Math.floor(Math.random() * opportunities.length)]
    router.push(opportunityPath(pick))
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-green">
        {/* Slow-drifting colour blobs for depth */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="animate-blob absolute -right-10 top-6 h-80 w-80 rounded-full bg-coral/20 blur-3xl" style={{ animationDelay: '3s' }} />
          <div className="animate-blob absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-brand-green-light/40 blur-3xl" style={{ animationDelay: '6s' }} />
        </div>

        {/* Cute floating decorations — purely decorative, hidden on small screens */}
        <div className="pointer-events-none absolute inset-0 hidden select-none sm:block" aria-hidden>
          <span className="animate-floaty absolute left-[6%] top-[18%] text-4xl opacity-70" style={{ '--tilt': '-12deg', animationDelay: '0s' }}>🌱</span>
          <span className="animate-floaty absolute right-[8%] top-[14%] text-4xl opacity-70" style={{ '--tilt': '10deg', animationDelay: '0.8s' }}>🐾</span>
          <span className="animate-floaty absolute left-[12%] bottom-[16%] text-3xl opacity-60" style={{ '--tilt': '8deg', animationDelay: '1.6s' }}>🎨</span>
          <span className="animate-floaty absolute right-[12%] bottom-[20%] text-4xl opacity-70" style={{ '--tilt': '-10deg', animationDelay: '2.4s' }}>🤝</span>
          <span className="animate-floaty absolute left-[46%] top-[8%] text-2xl opacity-50" style={{ '--tilt': '6deg', animationDelay: '1.2s' }}>⭐</span>
          <span className="animate-floaty absolute right-[30%] bottom-[10%] text-2xl opacity-50" style={{ '--tilt': '-6deg', animationDelay: '3s' }}>📚</span>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-cream-text/10 px-4 py-1.5 text-sm font-bold text-cream-text ring-1 ring-cream-text/20">
            ✨ Free for students earning service hours
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-cream-text sm:text-6xl">
            <span className="relative inline-block">
              Unlock
              <svg
                className="squiggle-draw absolute -bottom-2 left-0 w-full sm:-bottom-3"
                height="16"
                viewBox="0 0 200 16"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 11 Q 27 3 52 9 T 100 9 T 148 9 T 197 8"
                  stroke="#E8983E"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength="1"
                />
              </svg>
            </span>{' '}
            your community.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream-muted">
            VolunteerVault helps you find real volunteer opportunities, log your hours, and build
            a verified service record — one shareable link colleges and employers can trust.
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
              <StatPill value={<CountUp end={orgCount} />} label="organizations" tone="dark" />
              <StatPill value={<CountUp end={remoteCount} />} label="you can do remotely" tone="dark" />
              <StatPill value={<CountUp end={causeCount} />} label="causes to explore" tone="dark" />
            </div>
          )}
        </div>
      </section>

      {activeChallenge && (
        <section className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
          <ChallengeBanner challenge={activeChallenge} progress={user ? challengeProgress : null} />
        </section>
      )}

      {/* Explore — cause chips + universal ways in (work no matter where you live) */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="font-display text-lg font-extrabold text-brand-green">What are you into?</h2>
        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} {...c} href={`/volunteer/${c.id}`} />
          ))}
        </div>

        {/* Ways to explore — not tied to any one city, so it fits everyone */}
        <h2 className="mt-8 font-display text-lg font-extrabold text-brand-green">
          Not sure where to start?
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link
            href="/browse?remote=1"
            className="group flex items-center gap-3 rounded-card border-2 border-brand-green bg-brand-green p-4 shadow-card transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl" aria-hidden>🌐</span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-cream-text">From anywhere</span>
              <span className="text-xs text-cream-muted">
                {remoteCount} online role{remoteCount === 1 ? '' : 's'} — no car needed
              </span>
            </span>
          </Link>
          <Link
            href="/volunteer"
            className="group flex items-center gap-3 rounded-card border-2 border-card-border bg-card p-4 shadow-card transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl" aria-hidden>📍</span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-brand-green">Near you</span>
              <span className="text-xs text-brand-green/60">Pick your state &amp; city</span>
            </span>
          </Link>
          <Link
            href="/browse"
            className="group flex items-center gap-3 rounded-card border-2 border-card-border bg-card p-4 shadow-card transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl" aria-hidden>🧭</span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-brand-green">See everything</span>
              <span className="text-xs text-brand-green/60">Browse &amp; filter all {orgCount}</span>
            </span>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={surpriseMe}
            className="hover-wiggle inline-flex items-center gap-2 rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
          >
            🎲 Surprise me
          </button>
          <p className="mt-1.5 text-xs text-brand-green/50">Feeling spontaneous? We'll pick one for you.</p>
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
              www.volunteervault.org/u/you
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
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-extrabold text-brand-green">
          How VolunteerVault works
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-brand-green/60">
          Three easy steps from "I need service hours" to a record you can actually show off.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', emoji: '🔎', title: 'Find it', body: 'Browse opportunities by interest and location — see who\'s already going.' },
            { step: '2', emoji: '✍️', title: 'Log it', body: 'Show up, then log your own hours — honor system, no scanning or codes needed.' },
            { step: '3', emoji: '🔓', title: 'Vault it', body: 'Once the date passes, it\'s verified and lands straight in your shareable vault.' },
          ].map((s) => (
            <div
              key={s.step}
              className="relative rounded-card border border-card-border bg-card p-6 pt-8 text-center shadow-card transition-transform hover:-translate-y-1"
            >
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-pill bg-coral font-display text-sm font-extrabold text-cream-text shadow-pop">
                {s.step}
              </div>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cream text-3xl">
                {s.emoji}
              </div>
              <h3 className="font-display font-bold text-brand-green">{s.title}</h3>
              <p className="mt-1 text-sm text-brand-green/70">{s.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Leaderboards preview */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
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
      </Reveal>

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
    <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
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
    </Reveal>
  )
}
