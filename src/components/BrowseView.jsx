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
import { isRemote, minAgeOf, stateOf, cityOf, zipOf, commitmentOf } from '../lib/opportunityFilters'
import OpportunityCard from './OpportunityCard'
import SuggestOpportunity from './SuggestOpportunity'
import ChallengeBanner from './ChallengeBanner'

// Leaflet touches `window` at import time, which breaks the server render
// pass — load it client-only.
const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false })

const TOGGLES = [
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

  const [opportunities] = useState(initialOpportunities)
  const [query, setQuery] = useState(initialQuery)
  const [toggles, setToggles] = useState(searchParams.get('remote') ? ['remote'] : [])
  const [stateFilter, setStateFilter] = useState('')
  const [cityZip, setCityZip] = useState('')
  const [commitment, setCommitment] = useState('')
  const [age, setAge] = useState('')
  const [streakWeeks, setStreakWeeks] = useState(0)
  const [challengeProgress, setChallengeProgress] = useState(null)
  const activeChallenge = getActiveChallenge()

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

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const ageNum = age ? Number(age) : null
    return opportunities.filter((o) => {
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
      if (cityZip.trim() && !isRemote(o)) {
        const needle = cityZip.trim().toLowerCase()
        const cityMatch = cityOf(o).toLowerCase().includes(needle)
        const zipMatch = zipOf(o).toLowerCase().startsWith(needle)
        if (!cityMatch && !zipMatch) return false
      }
      return true
    })
  }, [opportunities, activeCategory, query, toggles, stateFilter, cityZip, commitment, age])

  const anyFilter = toggles.length || stateFilter || cityZip || commitment || age || activeCategory

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SuggestOpportunity onOrganizeClick={() => router.push('/community')} />

      <h1 className="mt-6 font-display text-3xl font-extrabold text-brand-green">Browse opportunities</h1>
      <p className="mt-1 text-brand-green/60">Real organizations recruiting volunteers right now — filter down to your people.</p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search opportunities..."
        className="mt-6 w-full rounded-pill border border-card-border bg-card px-5 py-3 text-sm text-brand-green shadow-card outline-none placeholder:text-brand-green/40"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          <p className="text-sm font-semibold text-brand-green/50">
            {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
          {filtered.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Nothing matches yet — try clearing a filter.
            </p>
          )}
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}
        </div>

        {/* Filters + map travel down the page with you (sticky) so you never have to scroll back up to change something */}
        <div className="order-1 flex flex-col gap-4 lg:sticky lg:top-24 lg:order-2 lg:max-h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <div className="scrollbar-none flex flex-col gap-3 rounded-card border border-card-border bg-card p-4 shadow-card">
            {/* Category / cause */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`shrink-0 rounded-pill px-3 py-1.5 text-xs font-bold shadow-card transition-transform hover:scale-105 ${
                    activeCategory === c.id
                      ? 'bg-brand-green text-cream-text'
                      : 'bg-cream text-brand-green border border-card-border'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Quick toggles */}
            <div className="scrollbar-none flex flex-wrap gap-2">
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
                  {f.label}
                </button>
              ))}
            </div>

            {/* Structured filters */}
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                I'm this old
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-20 rounded-pill border border-card-border bg-cream px-3 py-1.5 text-xs text-brand-green outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                State
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="rounded-pill border border-card-border bg-cream px-3 py-1.5 text-xs text-brand-green outline-none"
                >
                  <option value="">Any</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                City or ZIP
                <input
                  type="text"
                  placeholder="e.g. Atlanta"
                  value={cityZip}
                  onChange={(e) => setCityZip(e.target.value)}
                  className="w-28 rounded-pill border border-card-border bg-cream px-3 py-1.5 text-xs text-brand-green outline-none"
                />
              </label>
              <div className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
                Commitment
                <div className="flex rounded-pill border border-card-border bg-cream p-0.5">
                  {COMMITMENTS.map((c) => (
                    <button
                      key={c.id || 'any'}
                      onClick={() => setCommitment(c.id)}
                      className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${
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
                  className="rounded-pill border border-card-border px-3 py-1.5 text-xs font-bold text-coral"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="rounded-card border border-card-border bg-card p-4 shadow-card">
            <MapPreview opportunities={filtered} />
            <Link
              href="/map"
              className="mt-3 block w-full rounded-pill border border-card-border py-2 text-center text-sm font-bold text-brand-green hover:bg-cream"
            >
              Open full map
            </Link>
          </div>

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
        </div>
      </div>
    </div>
  )
}
