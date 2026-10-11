'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CATEGORIES, US_STATES } from '../data/mockData'
import { fetchMyStreak, fetchHourLogs } from '../lib/api'
import { getActiveChallenge } from '../data/challenges'
import { computeChallengeProgress } from '../lib/challenges'
import { useAuth } from '../lib/AuthContext'
import { isRemote, minAgeOf, stateOf, cityOf, commitmentOf } from '../lib/opportunityFilters'
import { zipToPlace, looksLikeZip } from '../data/zipMetros'
import { useSavedIds } from '../lib/saved'
import OpportunityCard from './OpportunityCard'
import SuggestOpportunity from './SuggestOpportunity'
import ChallengeBanner from './ChallengeBanner'
import FunHero, { Squiggle } from './FunHero'

// Leaflet touches `window` at import time, which breaks the server render
// pass — load it client-only.
const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false })

const TOGGLES = [
  { id: 'saved', label: '❤️ Saved' },
  { id: 'remote', label: '🌐 Remote only' },
  { id: 'highSchool', label: '🎒 High-school friendly' },
  { id: 'serviceHours', label: '✓ Counts for service hours' },
]

const COMMITMENTS = [
  { id: '', label: 'Any' },
  { id: 'one-time', label: 'One-time' },
  { id: 'ongoing', label: 'Ongoing' },
]

// Location/eligibility field accessors live in ../lib/opportunityFilters so
// the /volunteer landing pages group listings by exactly the same rules.

// Seeded with opportunities fetched server-side (see app/browse/page.jsx) so
// the full listing set is present in the initial HTML for SEO — all
// filtering below then happens client-side against that same data.
export default function BrowseView({ initialOpportunities }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const initialQuery = searchParams.get('q') ?? ''
  // The homepage search sends the "Near you" box through as ?loc= — seed the
  // location filter with it so searching from the home hero actually filters
  // by place instead of dumping you on the full, unfiltered list.
  const initialLoc = searchParams.get('loc') ?? ''

  const [opportunities, setOpportunities] = useState(initialOpportunities)
  // Shuffle once after mount so the top listing changes every visit (not the
  // same one forever). Done in an effect — not in the initial state — so the
  // server HTML and first client render still match (no hydration mismatch),
  // then it reshuffles on the client. Stable during filtering afterward.
  useEffect(() => {
    setOpportunities((prev) => {
      const a = [...prev]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    })
  }, [])
  const [query, setQuery] = useState(initialQuery)
  const [toggles, setToggles] = useState(() => {
    const t = []
    if (searchParams.get('remote')) t.push('remote')
    if (searchParams.get('saved')) t.push('saved')
    return t
  })
  const [stateFilter, setStateFilter] = useState('')
  const [cityZip, setCityZip] = useState(initialLoc)
  const [commitment, setCommitment] = useState('')
  const [age, setAge] = useState('')
  const [showFilters, setShowFilters] = useState(false) // phones only; always open on desktop
  const [streakWeeks, setStreakWeeks] = useState(0)
  const [challengeProgress, setChallengeProgress] = useState(null)
  const activeChallenge = getActiveChallenge()
  const savedIds = useSavedIds()

  useEffect(() => {
    if (!user) return
    fetchMyStreak(user.id).then(setStreakWeeks).catch(() => setStreakWeeks(0))
    if (activeChallenge) {
      fetchHourLogs(user.id)
        .then((logs) => setChallengeProgress(computeChallengeProgress(activeChallenge, logs)))
        .catch(() => setChallengeProgress(null))
    }
  }, [user, activeChallenge])

  function toggle(id) {
    setToggles((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function toggleCategory(id) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCategory === id) params.delete('category')
    else params.set('category', id)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    setToggles([])
    setStateFilter('')
    setCityZip('')
    setCommitment('')
    setAge('')
    if (activeCategory) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('category')
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Resolve the location box once per render: a ZIP maps to a metro (see
  // zipMetros), plain text stays a city-name search. An unrecognized ZIP
  // resolves to nothing, and we surface a hint instead of silently emptying
  // the list.
  const trimmedLoc = cityZip.trim()
  const locIsZip = looksLikeZip(trimmedLoc)
  const zipPlace = locIsZip ? zipToPlace(trimmedLoc) : null
  const zipUnresolved = locIsZip && !zipPlace

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const ageNum = age ? Number(age) : null
    const cityNeedle = !locIsZip ? trimmedLoc.toLowerCase() : ''
    const savedSet = new Set(savedIds)
    return opportunities.filter((o) => {
      if (toggles.includes('saved') && !savedSet.has(o.id)) return false
      if (activeCategory && o.category !== activeCategory) return false
      if (
        q &&
        !o.title.toLowerCase().includes(q) &&
        !(o.description ?? '').toLowerCase().includes(q) &&
        !(o.org?.name ?? '').toLowerCase().includes(q)
      )
        return false
      if (toggles.includes('remote') && !isRemote(o)) return false
      if (toggles.includes('highSchool') && minAgeOf(o) > 14) return false
      if (toggles.includes('serviceHours') && o.org?.countsForServiceHours === false) return false
      // "show only ones I'm old enough for"
      if (ageNum != null && minAgeOf(o) > ageNum) return false
      // commitment: a 'both' listing satisfies either selection
      if (commitment && commitmentOf(o) !== commitment && commitmentOf(o) !== 'both') return false
      // remote listings are joinable from any state, so they always pass
      if (stateFilter && !isRemote(o) && stateOf(o) !== stateFilter) return false
      // Location: remote listings are joinable anywhere, so they always pass.
      if (trimmedLoc && !isRemote(o)) {
        if (zipPlace) {
          if (
            cityOf(o).toLowerCase() !== zipPlace.city.toLowerCase() ||
            stateOf(o).toLowerCase() !== zipPlace.state.toLowerCase()
          )
            return false
        } else if (cityNeedle) {
          if (!cityOf(o).toLowerCase().includes(cityNeedle)) return false
        }
        // An unrecognized ZIP applies no location filter (see the hint below).
      }
      return true
    })
  }, [opportunities, activeCategory, query, toggles, stateFilter, trimmedLoc, locIsZip, zipPlace, commitment, age, savedIds])

  const anyFilter = toggles.length || stateFilter || cityZip || commitment || age || activeCategory
  const hiddenFilterCount = toggles.length + [stateFilter, cityZip, commitment, age].filter(Boolean).length

  const streakAndChallenge = (
    <>
      {user && (
        <div className="rounded-card bg-brand-green p-5 shadow-card">
          {streakWeeks > 0 ? (
            <>
              <p className="font-display font-bold text-cream-text">
                🔥 {streakWeeks}-week streak — keep it alive
              </p>
              <p className="mt-1 text-sm text-cream-muted">
                Log hours again by Sunday to keep it going — pick anything above.
              </p>
            </>
          ) : (
            <>
              <p className="font-display font-bold text-cream-text">🔥 Start a streak</p>
              <p className="mt-1 text-sm text-cream-muted">
                Log your first hours this week to get one going.
              </p>
            </>
          )}
        </div>
      )}

      {activeChallenge && <ChallengeBanner challenge={activeChallenge} progress={challengeProgress} compact />}
    </>
  )

  return (
    <div>
      <FunHero
        size="sm"
        eyebrow="🔎 Browse"
        title={
          <>
            Find your <Squiggle>thing</Squiggle>
          </>
        }
        subtitle="Real organizations recruiting volunteers right now — filter down to your people."
        badges={[
          { e: '🌱', bg: 'bg-category-environment-bg' },
          { e: '🐾', bg: 'bg-category-animals-bg' },
          { e: '📚', bg: 'bg-category-education-bg' },
          { e: '🍲', bg: 'bg-category-food-bg' },
        ]}
      >
        <div className="relative mx-auto max-w-2xl">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg" aria-hidden>
            🔎
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search animals, tutoring, cleanups..."
            aria-label="Search opportunities"
            className="w-full rounded-pill border-2 border-brand-green bg-card py-3.5 pl-12 pr-5 text-base text-brand-green shadow-pop outline-none placeholder:text-brand-green/40"
          />
        </div>
      </FunHero>

      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
      <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
          <p className="text-sm font-semibold text-brand-green/50">
            {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
          {filtered.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              {toggles.includes('saved') && savedIds.length === 0
                ? 'No saved opportunities yet — tap the 🤍 on any card to save it for later.'
                : 'Nothing matches yet — try clearing a filter.'}
            </p>
          )}
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}

          {/* On phones the streak/challenge cards live under the results instead of pushing them down */}
          <div className="mt-4 flex flex-col gap-4 lg:hidden">{streakAndChallenge}</div>
        </div>

        {/* Filters + map travel down the page with you (sticky) so you never have to scroll back up to change something */}
        <div className="order-1 flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:order-2 lg:max-h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <div className="flex flex-col gap-3 rounded-card border border-card-border bg-card p-4 shadow-card">
            {/* Category / cause — one swipeable row on phones, wrapped on desktop */}
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-bold shadow-card transition-transform hover:scale-105 ${
                    activeCategory === c.id
                      ? 'bg-brand-green text-cream-text'
                      : 'bg-cream text-brand-green border border-card-border'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Phones: filters fold away behind one button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={`flex-1 rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                  showFilters || hiddenFilterCount
                    ? 'bg-brand-green text-cream-text'
                    : 'border border-card-border bg-cream text-brand-green'
                }`}
              >
                ⚙️ Filters{hiddenFilterCount ? ` (${hiddenFilterCount})` : ''} {showFilters ? '▲' : '▼'}
              </button>
              <Link
                href="/map"
                className="rounded-pill border border-card-border bg-cream px-4 py-2 text-sm font-bold text-brand-green"
              >
                🗺️ Map
              </Link>
              {anyFilter && (
                <button onClick={clearAll} className="px-1 text-xs font-bold text-coral">
                  Clear
                </button>
              )}
            </div>

            <div className={`${showFilters ? 'flex' : 'hidden'} flex-col gap-3 lg:flex`}>
              {/* Quick toggles */}
              <div className="flex flex-wrap gap-2">
                {TOGGLES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className={`shrink-0 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                      toggles.includes(f.id)
                        ? 'bg-gold text-gold-text'
                        : 'bg-cream text-brand-green/70 border border-card-border'
                    }`}
                  >
                    {f.id === 'saved' && savedIds.length ? `❤️ Saved (${savedIds.length})` : f.label}
                  </button>
                ))}
              </div>

              {/* Structured filters — a tidy 2-column grid on phones */}
              <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
                <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                  I'm this old
                  <input
                    type="number"
                    min="0"
                    max="120"
                    inputMode="numeric"
                    placeholder="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-pill border border-card-border bg-cream px-3 py-2 text-sm text-brand-green outline-none sm:w-20 sm:py-1.5 sm:text-xs"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                  State
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full rounded-pill border border-card-border bg-cream px-3 py-2 text-sm text-brand-green outline-none sm:w-auto sm:py-1.5 sm:text-xs"
                  >
                    <option value="">Any</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                  City or ZIP
                  <input
                    type="text"
                    placeholder="e.g. Atlanta or 30303"
                    value={cityZip}
                    onChange={(e) => setCityZip(e.target.value)}
                    className="w-full rounded-pill border border-card-border bg-cream px-3 py-2 text-sm text-brand-green outline-none sm:w-32 sm:py-1.5 sm:text-xs"
                  />
                  {zipPlace && (
                    <span className="font-semibold text-brand-green/50">
                      📍 {zipPlace.city}, {zipPlace.state}
                    </span>
                  )}
                  {zipUnresolved && (
                    <span className="font-semibold text-coral">ZIP not recognized — try a city name</span>
                  )}
                </label>
                <div className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                  Commitment
                  <div className="flex rounded-pill border border-card-border bg-cream p-0.5">
                    {COMMITMENTS.map((c) => (
                      <button
                        key={c.id || 'any'}
                        onClick={() => setCommitment(c.id)}
                        className={`flex-1 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors sm:flex-none sm:py-1 ${
                          commitment === c.id ? 'bg-brand-green text-cream-text' : 'text-brand-green/60'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                {anyFilter && (
                  <button
                    onClick={clearAll}
                    className="hidden rounded-pill border border-card-border px-3 py-1.5 text-xs font-bold text-coral lg:block"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Map preview: desktop sidebar only — phones get the 🗺️ Map button above */}
          <div className="hidden rounded-card border border-card-border bg-card p-4 shadow-card lg:block">
            <MapPreview opportunities={filtered} />
            <Link
              href="/map"
              className="mt-3 block w-full rounded-pill border border-card-border py-2 text-center text-sm font-bold text-brand-green hover:bg-cream"
            >
              Open full map
            </Link>
          </div>

          <div className="hidden flex-col gap-4 lg:flex">{streakAndChallenge}</div>
        </div>
      </div>

      <div className="mt-14">
        <SuggestOpportunity onOrganizeClick={() => router.push('/student-led?tab=projects')} />
      </div>
      </div>
    </div>
  )
}
