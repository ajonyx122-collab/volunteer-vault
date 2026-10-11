'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '../data/mockData'
import { fetchHourLogs } from '../lib/api'
import { getActiveChallenge } from '../data/challenges'
import { computeChallengeProgress } from '../lib/challenges'
import { useAuth } from '../lib/AuthContext'
import SectionTitle from './SectionTitle'
import WaveDivider from './WaveDivider'
import { CATEGORY_STYLES } from './categoryStyles'
import OpportunityCard from './OpportunityCard'
import StatPill from './StatPill'
import ChallengeBanner from './ChallengeBanner'
import CountUp from './CountUp'
import Reveal from './Reveal'
import SurpriseMe from './SurpriseMe'
import Mascot from './Mascot'
import StudentOrgCard from './StudentOrgCard'

const MEDALS = ['🥇', '🥈', '🥉']

const isRemote = (o) => o.remote || o.isOnline || o.org?.remote
const minAgeOf = (o) => o.minAge ?? o.org?.minAge ?? 0

// Pick `n` items that refresh every day. We give each item a deterministic
// pseudo-random score derived from (today's day number + seed, item id), then
// take the lowest-scoring `n`. Because the score rehashes every day, the whole
// set turns over daily (not a slide-by-one) — and because it's computed from
// the date + a stable id, the server render and client hydration agree (no
// mismatch). A per-section seed keeps sections from matching each other.
function dailyPick(arr, n = 4, seed = 0) {
  if (arr.length <= n) return arr
  const day = Math.floor(Date.now() / (24 * 3600 * 1000)) + seed * 101
  const score = (id) => {
    let h = day >>> 0
    const s = String(id)
    for (let i = 0; i < s.length; i++) h = (Math.imul(h ^ s.charCodeAt(i), 0x5bd1e995) >>> 0)
    h ^= h >>> 13
    h = Math.imul(h, 0x5bd1e995) >>> 0
    h ^= h >>> 15
    return h >>> 0
  }
  return [...arr]
    .map((v) => [v, score(v.id)])
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map((x) => x[0])
}

// Seeded with opportunities/topVolunteers fetched server-side (see
// app/page.jsx) so the listing content is present in the initial HTML for
// SEO — only the challenge banner (needs the logged-in user) fetches
// client-side, and the search form is interactive by nature.
export default function HomeView({ opportunities, topVolunteers, spotlightOrgs = [] }) {
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

  // Featured / high-school / remote each rotate daily so the homepage doesn't
  // show the same four cards forever. rotateDaily advances a window through the
  // (stable-ordered) pool by the day number — derived from the date only, so
  // the server HTML and client hydration compute the same set (no mismatch). A
  // per-section seed keeps them from rotating in lockstep.
  const featured = useMemo(
    () => dailyPick(opportunities.filter((o) => o.org?.featured), 4, 0),
    [opportunities],
  )
  const highSchool = useMemo(
    () => dailyPick(opportunities.filter((o) => minAgeOf(o) <= 14), 4, 1),
    [opportunities],
  )
  const remote = useMemo(() => dailyPick(opportunities.filter(isRemote), 4, 2), [opportunities])

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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B6E42] via-brand-green to-[#14432b]">
        {/* Colourful drifting blobs for depth */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
          <div className="animate-blob absolute -right-10 top-6 h-80 w-80 rounded-full bg-coral/30 blur-3xl" style={{ animationDelay: '3s' }} />
          <div className="animate-blob absolute -bottom-16 left-1/4 h-72 w-72 rounded-full bg-category-music-text/25 blur-3xl" style={{ animationDelay: '6s' }} />
          <div className="animate-blob absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-category-animals-text/25 blur-3xl" style={{ animationDelay: '9s' }} />
        </div>

        {/* Volunteering-themed badges arranged as a tidy, symmetric frame down
            each side — "scattered, but organized". Hidden on small screens. */}
        <div className="pointer-events-none absolute inset-0 hidden select-none lg:block" aria-hidden>
          {[
            // left column, evenly spaced
            { e: '🌳', bg: 'bg-category-environment-bg', pos: 'left-[5%] top-[20%]', d: '0s', t: '-8deg' },
            { e: '🩺', bg: 'bg-category-medicine-bg', pos: 'left-[5%] top-[48%]', d: '1s', t: '6deg' },
            { e: '🎨', bg: 'bg-category-art-bg', pos: 'left-[5%] top-[76%]', d: '2s', t: '8deg' },
            // right column, mirrored
            { e: '🍲', bg: 'bg-category-food-bg', pos: 'right-[5%] top-[20%]', d: '0.5s', t: '8deg' },
            { e: '🐾', bg: 'bg-category-animals-bg', pos: 'right-[5%] top-[48%]', d: '1.5s', t: '-6deg' },
            { e: '🤝', bg: 'bg-category-community-bg', pos: 'right-[5%] top-[76%]', d: '2.5s', t: '-8deg' },
          ].map((b, i) => (
            <span
              key={i}
              className={`animate-floaty absolute flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-pop ${b.bg} ${b.pos}`}
              style={{ '--tilt': b.t, animationDelay: b.d }}
            >
              {b.e}
            </span>
          ))}
        </div>

        <Mascot />

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="flex items-center justify-center gap-2">
            <img src="/brand/logo-white.png" alt="" className="h-8 w-8" />
            <span className="font-display text-2xl font-extrabold tracking-tight text-cream-text sm:text-3xl">
              Volunteer<span className="text-gold">VAULT</span>
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-cream-text/10 px-4 py-1.5 text-sm font-bold text-cream-text ring-1 ring-cream-text/20">
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

      {/* Cause ticker — a tilted gold tape scrolling across under the hero */}
      <div className="marquee-pause relative z-10 -mt-3 overflow-hidden" aria-hidden>
        <div className="-mx-4 -rotate-1 border-y-2 border-brand-green bg-gold py-2.5 shadow-pop">
          <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-wide text-gold-text">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <span key={i}>
                {c.icon} {c.label} <span className="ml-6 text-brand-green">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {activeChallenge && (
        <section className="mx-auto max-w-2xl px-4 pt-10 sm:px-6">
          <ChallengeBanner challenge={activeChallenge} progress={user ? challengeProgress : null} />
        </section>
      )}

      {/* What are you into? — big colorful cause tiles */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <SectionTitle kicker="Pick your thing" title="What are you into?" action={{ href: '/volunteer', label: 'All causes' }} />
        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.id}
              href={`/volunteer/${c.id}`}
              className={`group flex flex-col items-center justify-center gap-1 rounded-card border-2 border-brand-green px-2 py-4 text-center shadow-pop-soft transition-all hover:-translate-y-1 hover:shadow-pop ${
                CATEGORY_STYLES[c.id]?.chip ?? 'bg-card text-brand-green'
              }`}
              style={{ transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1][i % 5]}deg)` }}
            >
              <span className="text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12 sm:text-4xl" aria-hidden>
                {c.icon}
              </span>
              <span className="text-xs font-extrabold sm:text-sm">{c.label}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Not sure where to start? */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <SectionTitle kicker="No idea yet? That's fine" title="Start somewhere easy" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: '/browse?remote=1',
              icon: '🌐',
              title: 'From your couch',
              body: `${remoteCount} online role${remoteCount === 1 ? '' : 's'} — no car needed`,
              tone: 'bg-brand-green text-cream-text',
              sub: 'text-cream-muted',
            },
            {
              href: '/volunteer',
              icon: '📍',
              title: 'Near you',
              body: 'Pick your state & city',
              tone: 'bg-category-food-bg text-brand-green',
              sub: 'text-brand-green/60',
            },
            {
              href: '/browse',
              icon: '🧭',
              title: 'See everything',
              body: `Browse & filter all ${orgCount} orgs`,
              tone: 'bg-category-music-bg text-brand-green',
              sub: 'text-brand-green/60',
            },
          ].map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className={`group flex items-center gap-4 rounded-card border-2 border-brand-green p-5 shadow-pop-soft transition-all hover:-translate-y-1 hover:shadow-pop ${w.tone}`}
            >
              <span className="text-4xl transition-transform group-hover:-rotate-12 group-hover:scale-110" aria-hidden>
                {w.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-extrabold">{w.title}</span>
                <span className={`text-sm ${w.sub}`}>{w.body}</span>
              </span>
              <span className="ml-auto text-xl transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
        <SurpriseMe opportunities={opportunities} />
      </Reveal>

      {featured.length > 0 && (
        <OppSection kicker="⭐ Hand-picked" title="Featured" blurb="Well-known organizations recruiting right now.">
          {featured}
        </OppSection>
      )}

      {highSchool.length > 0 && (
        <OppSection kicker="🎒 Service-hour friendly" title="Great for high schoolers" blurb="Open to volunteers 14 and under.">
          {highSchool}
        </OppSection>
      )}

      {remote.length > 0 && (
        <OppSection kicker="🛋️ Zero commute" title="Do it from home" blurb="Make an impact from your couch." href="/browse?remote=1">
          {remote}
        </OppSection>
      )}

      {spotlightOrgs.length > 0 && (
        <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
          <SectionTitle
            kicker="🎓 Student founder spotlight"
            title="Started by people your age"
            action={{ href: '/student-led', label: 'See all' }}
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {spotlightOrgs.map((org) => (
              <StudentOrgCard key={org.id} org={org} />
            ))}
          </div>
        </Reveal>
      )}

      {/* Your vault = your proof */}
      <div className="mt-16">
        <WaveDivider className="text-brand-green" />
        <section className="bg-dots-light relative overflow-hidden bg-brand-green">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div className="text-center md:text-left">
              <SectionTitle kicker="Your proof" title="Your vault = your receipts." tone="dark" />
              <p className="mx-auto mt-4 max-w-md text-cream-muted md:mx-0">
                Every hour you log lands in your public vault — one link colleges, scholarships, and
                employers can actually trust. No spreadsheets. No lost paper forms.
              </p>
              <Link
                href="/profile"
                className="mt-6 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
              >
                Open my vault 🔐
              </Link>
            </div>

            {/* A pretend vault card — shows what yours will look like */}
            <div className="mx-auto w-full max-w-sm rotate-2 transition-transform hover:rotate-0">
              <div className="overflow-hidden rounded-card border-2 border-brand-green bg-cream shadow-pop-lg">
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#1B6E42] to-brand-green px-5 py-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-display text-lg font-extrabold text-gold-text">
                    YOU
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-extrabold text-cream-text">Your Name</p>
                    <p className="truncate text-xs text-cream-muted">volunteervault.org/u/you</p>
                  </div>
                  <span className="ml-auto rounded-pill bg-cream-text/15 px-2 py-0.5 text-[10px] font-bold text-cream-text">
                    ✓ Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {[
                    { v: '42', l: 'hours' },
                    { v: '🔥 6', l: 'wk streak' },
                    { v: '5', l: 'causes' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-card bg-card p-2 text-center shadow-card">
                      <p className="font-display text-lg font-extrabold text-brand-green">{s.v}</p>
                      <p className="text-[10px] font-bold uppercase text-brand-green/50">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-2 px-4 pb-4">
                  {['🌱', '🐾', '🍲', '📚', '🏅'].map((b, i) => (
                    <span
                      key={b}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-green bg-gold/30 text-lg"
                      style={{ transform: `rotate(${(i - 2) * 6}deg)` }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-center text-xs font-bold text-cream-muted">↑ what yours could look like</p>
            </div>
          </div>
        </section>
        <WaveDivider className="text-brand-green" flip />
      </div>

      {/* How it works */}
      <Reveal as="section" className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <SectionTitle kicker="Easy as 1-2-3" title="How it works" center />
        <ol className="relative mt-8 grid gap-6 sm:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-9 hidden border-t-4 border-dashed border-gold/60 sm:block" aria-hidden />
          {[
            { emoji: '🔎', title: 'Find it', body: "Browse by cause and place — see who's already going." },
            { emoji: '✍️', title: 'Log it', body: 'Show up, then log your hours. Honor system, no codes.' },
            { emoji: '🔓', title: 'Vault it', body: 'Once the date passes it lands in your shareable vault.' },
          ].map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center">
              <span className="hover-wiggle relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-cream bg-gold text-4xl shadow-pop">
                {s.emoji}
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-coral text-sm font-extrabold text-cream-text">
                  {i + 1}
                </span>
              </span>
              <p className="mt-3 font-display text-xl font-extrabold text-brand-green">{s.title}</p>
              <p className="mt-1 max-w-[15rem] text-sm text-brand-green/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Leaderboard podium */}
      <Reveal as="section" className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
        <div className="bg-dots rounded-card border-2 border-brand-green bg-card p-6 shadow-pop-soft sm:p-10">
          <SectionTitle kicker="🏆 Season standings" title="Who's on top?" center />
          {topVolunteers.length > 0 ? (
            <div className="mx-auto mt-8 grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
              {[1, 0, 2].map((idx) => {
                const v = topVolunteers[idx]
                if (!v) return <div key={idx} />
                const height = ['h-28', 'h-20', 'h-14'][idx]
                return (
                  <div key={v.userId} className="flex flex-col items-center">
                    <span className="text-3xl">{MEDALS[idx]}</span>
                    <p className="mt-1 w-full truncate text-center text-xs font-extrabold text-brand-green sm:text-sm">{v.displayName}</p>
                    <p className="text-xs font-bold text-brand-green/60">{v.value} hrs</p>
                    <div
                      className={`mt-2 flex w-full items-start justify-center rounded-t-card border-2 border-b-0 border-brand-green pt-2 font-display text-2xl font-extrabold ${height} ${
                        idx === 0 ? 'bg-gold text-gold-text' : 'bg-cream text-brand-green'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mx-auto mt-4 max-w-md text-center text-sm text-brand-green/60">
              No board yet — log the first hours and claim the top spot.
            </p>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/leaderboards"
              className="inline-block rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
            >
              See full leaderboards
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Ways to go further */}
      <Reveal as="section" id="org-cta" className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              href: '/signup',
              icon: '🏢',
              kicker: 'Running an org?',
              title: 'Post opportunities free',
              body: 'Reach students actively looking for service hours.',
              tone: 'bg-gold text-gold-text',
              sub: 'text-gold-text/80',
              tilt: '-1deg',
            },
            {
              href: '/student-led',
              icon: '🎓',
              kicker: 'Started a nonprofit?',
              title: 'Get your own page',
              body: 'Mission, goal tracker, photos, and a donate button.',
              tone: 'bg-brand-green text-cream-text',
              sub: 'text-cream-muted',
              tilt: '0.8deg',
            },
            {
              href: '/ambassadors',
              icon: '📣',
              kicker: 'Know everyone at school?',
              title: 'Become an ambassador',
              body: 'Bring VolunteerVault to your school.',
              tone: 'bg-category-art-bg text-brand-green',
              sub: 'text-brand-green/70',
              tilt: '-0.6deg',
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group relative overflow-hidden rounded-card border-2 border-brand-green p-6 shadow-pop transition-all hover:-translate-y-1 hover:shadow-pop-lg ${c.tone}`}
              style={{ transform: `rotate(${c.tilt})` }}
            >
              <span className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-20 transition-transform group-hover:rotate-12" aria-hidden>
                {c.icon}
              </span>
              <p className={`text-xs font-extrabold uppercase tracking-wide ${c.sub}`}>{c.kicker}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{c.title}</p>
              <p className={`mt-1 text-sm ${c.sub}`}>{c.body}</p>
              <p className="mt-4 text-sm font-extrabold">Let's go →</p>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  )
}

function OppSection({ kicker, title, blurb, href = '/browse', children }) {
  return (
    <Reveal as="section" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <SectionTitle kicker={kicker} title={title} blurb={blurb} action={{ href, label: 'See all' }} />
      <div className="mt-6 flex flex-col gap-4">
        {children.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
        ))}
      </div>
    </Reveal>
  )
}
