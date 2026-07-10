import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CATEGORIES, US_STATES } from '../data/mockData'
import { fetchOpportunities } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import OpportunityCard from '../components/OpportunityCard'
import MapPreview from '../components/MapPreview'
import SuggestOpportunity from '../components/SuggestOpportunity'

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

// A listing's own field wins; fall back to its org's directory field.
const isRemote = (o) => o.remote || o.isOnline || o.org?.remote
const minAgeOf = (o) => o.minAge ?? o.org?.minAge ?? 0
const stateOf = (o) => o.state || o.org?.state || ''
const commitmentOf = (o) => o.org?.commitmentType ?? 'both'

export default function Browse() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const initialQuery = searchParams.get('q') ?? ''

  const [opportunities, setOpportunities] = useState([])
  const [loadingOpps, setLoadingOpps] = useState(true)
  const [query, setQuery] = useState(initialQuery)
  const [toggles, setToggles] = useState(searchParams.get('remote') ? ['remote'] : [])
  const [stateFilter, setStateFilter] = useState('')
  const [commitment, setCommitment] = useState('')
  const [age, setAge] = useState('')

  useEffect(() => {
    fetchOpportunities()
      .then(setOpportunities)
      .catch(() => setOpportunities([]))
      .finally(() => setLoadingOpps(false))
  }, [])

  function toggle(id) {
    setToggles((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function toggleCategory(id) {
    if (activeCategory === id) searchParams.delete('category')
    else searchParams.set('category', id)
    setSearchParams(searchParams)
  }

  function clearAll() {
    setToggles([])
    setStateFilter('')
    setCommitment('')
    setAge('')
    if (activeCategory) {
      searchParams.delete('category')
      setSearchParams(searchParams)
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
      return true
    })
  }, [opportunities, activeCategory, query, toggles, stateFilter, commitment, age])

  const anyFilter = toggles.length || stateFilter || commitment || age || activeCategory

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SuggestOpportunity />

      <h1 className="mt-6 font-display text-3xl font-extrabold text-brand-green">Browse opportunities</h1>
      <p className="mt-1 text-brand-green/60">Real organizations recruiting volunteers right now — filter down to your people.</p>

      <div className="mt-6 flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search opportunities..."
          className="w-full rounded-pill border border-card-border bg-card px-5 py-3 text-sm text-brand-green shadow-card outline-none placeholder:text-brand-green/40"
        />

        {/* Category / cause */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${
                activeCategory === c.id
                  ? 'bg-brand-green text-cream-text'
                  : 'bg-card text-brand-green border border-card-border'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Quick toggles */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {TOGGLES.map((f) => (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
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
              className="w-20 rounded-pill border border-card-border bg-card px-3 py-1.5 text-xs text-brand-green outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
            State
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-pill border border-card-border bg-card px-3 py-1.5 text-xs text-brand-green outline-none"
            >
              <option value="">Any</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1 text-xs font-semibold text-brand-green/60">
            Commitment
            <div className="flex rounded-pill border border-card-border bg-card p-0.5">
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {loadingOpps && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Loading opportunities...
            </p>
          )}
          {!loadingOpps && (
            <p className="text-sm font-semibold text-brand-green/50">
              {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
            </p>
          )}
          {!loadingOpps && filtered.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Nothing matches yet — try clearing a filter.
            </p>
          )}
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-card-border bg-card p-4 shadow-card">
            <MapPreview opportunities={filtered} />
            <Link
              to="/map"
              className="mt-3 block w-full rounded-pill border border-card-border py-2 text-center text-sm font-bold text-brand-green hover:bg-cream"
            >
              Open full map
            </Link>
          </div>

          {user && (
            <div className="rounded-card bg-brand-green p-5 shadow-card">
              <p className="font-display font-bold text-cream-text">🔥 Keep your streak alive</p>
              <p className="mt-1 text-sm text-cream-muted">
                Volunteer by Sunday to keep it going — pick anything above to lock it in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
