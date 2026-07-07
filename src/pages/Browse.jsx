import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../data/mockData'
import { fetchOpportunities } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import OpportunityCard from '../components/OpportunityCard'
import MapPreview from '../components/MapPreview'

const FILTERS = [
  { id: 'verifiedOnly', label: 'Verified only' },
  { id: 'thisWeek', label: 'This week' },
]

export default function Browse() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const initialQuery = searchParams.get('q') ?? ''

  const [opportunities, setOpportunities] = useState([])
  const [loadingOpps, setLoadingOpps] = useState(true)
  const [query, setQuery] = useState(initialQuery)
  const [activeFilters, setActiveFilters] = useState([])

  useEffect(() => {
    fetchOpportunities()
      .then(setOpportunities)
      .catch(() => setOpportunities([]))
      .finally(() => setLoadingOpps(false))
  }, [])

  function toggleFilter(id) {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function toggleCategory(id) {
    if (activeCategory === id) {
      searchParams.delete('category')
    } else {
      searchParams.set('category', id)
    }
    setSearchParams(searchParams)
  }

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      if (activeCategory && opp.category !== activeCategory) return false
      if (query && !opp.title.toLowerCase().includes(query.toLowerCase())) return false
      if (activeFilters.includes('verifiedOnly') && !opp.org?.verified) return false
      if (activeFilters.includes('thisWeek')) {
        const days = (new Date(opp.startsAt) - new Date()) / (1000 * 60 * 60 * 24)
        if (days > 7 || days < 0) return false
      }
      return true
    })
  }, [opportunities, activeCategory, query, activeFilters])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">Browse opportunities</h1>

      <div className="mt-6 flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search opportunities..."
          className="w-full rounded-pill border border-card-border bg-card px-5 py-3 text-sm text-brand-green shadow-card outline-none placeholder:text-brand-green/40"
        />

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

        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
                activeFilters.includes(f.id)
                  ? 'bg-gold text-gold-text'
                  : 'bg-cream text-brand-green/70 border border-card-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {loadingOpps && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Loading opportunities...
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
