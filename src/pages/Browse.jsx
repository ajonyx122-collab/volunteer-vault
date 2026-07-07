import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, opportunities, organizations, currentUser } from '../data/mockData'
import OpportunityCard from '../components/OpportunityCard'

const FILTERS = [
  { id: 'verifiedOnly', label: 'Verified only' },
  { id: 'goodForCrews', label: 'Good for crews' },
  { id: 'thisWeek', label: 'This week' },
]

function getOrg(orgId) {
  return organizations.find((o) => o.id === orgId)
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [activeFilters, setActiveFilters] = useState([])

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
      const org = getOrg(opp.orgId)
      if (activeFilters.includes('verifiedOnly') && !org?.verified) return false
      if (activeFilters.includes('goodForCrews') && !opp.tags.includes('good for crews')) return false
      if (activeFilters.includes('thisWeek')) {
        const days = (new Date(opp.startsAt) - new Date()) / (1000 * 60 * 60 * 24)
        if (days > 7 || days < 0) return false
      }
      return true
    })
  }, [activeCategory, query, activeFilters])

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
          {filtered.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Nothing matches yet — try clearing a filter.
            </p>
          )}
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={getOrg(opp.orgId)} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-card-border bg-card p-4 shadow-card">
            <div className="flex h-40 items-center justify-center rounded-card bg-cream text-sm text-brand-green/50">
              🗺️ Map preview
            </div>
            <button className="mt-3 w-full rounded-pill border border-card-border py-2 text-sm font-bold text-brand-green hover:bg-cream">
              Open full map
            </button>
          </div>

          <div className="rounded-card bg-brand-green p-5 shadow-card">
            <p className="font-display font-bold text-cream-text">🔥 {currentUser.streakWeeks}-week streak</p>
            <p className="mt-1 text-sm text-cream-muted">
              Volunteer by Sunday to keep it alive — pick anything above to lock it in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
