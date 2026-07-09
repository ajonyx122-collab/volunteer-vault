import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAll, getByCategory, getByMaxAge, getVirtual, getVerifying, getCategories } from '../data/opportunities'
import DirectoryCard from '../components/DirectoryCard'

const AGE_BRACKETS = [
  { id: '12', label: '12 & under (with a parent)', max: 12 },
  { id: '15', label: '13–15', max: 15 },
  { id: '17', label: '16–17', max: 17 },
  { id: '18', label: '18+', max: Infinity },
]

const ALL_CATEGORIES = getCategories()

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeAge = searchParams.get('age') ?? ''
  const activeCategory = searchParams.get('category') ?? ''
  const virtualOnly = searchParams.get('virtual') === '1'
  const verifiedOnly = searchParams.get('verified') === '1'

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function toggleParam(key) {
    setParam(key, searchParams.get(key) === '1' ? '' : '1')
  }

  function selectAge(id) {
    setParam('age', activeAge === id ? '' : id)
  }

  function selectCategory(cat) {
    setParam('category', activeCategory === cat ? '' : cat)
  }

  function clearAll() {
    setSearchParams(new URLSearchParams())
  }

  const anyFilter = activeAge || activeCategory || virtualOnly || verifiedOnly

  const filtered = useMemo(() => {
    let list = getAll()
    if (activeCategory) list = getByCategory(activeCategory, list)
    if (activeAge) {
      const bracket = AGE_BRACKETS.find((b) => b.id === activeAge)
      if (bracket) list = getByMaxAge(bracket.max, list)
    }
    if (virtualOnly) list = getVirtual(list)
    if (verifiedOnly) list = getVerifying(list)
    return list
  }, [activeCategory, activeAge, virtualOnly, verifiedOnly])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">
        Volunteer from anywhere
      </h1>
      <p className="mt-1 text-brand-green/60">
        Free, virtual and national volunteer opportunities for students — no sign-up required
        to browse.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {/* Age bracket */}
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand-green/50">
            How old are you?
          </p>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {AGE_BRACKETS.map((b) => (
              <button
                key={b.id}
                onClick={() => selectAge(b.id)}
                className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${
                  activeAge === b.id
                    ? 'bg-brand-green text-cream-text'
                    : 'border border-card-border bg-card text-brand-green'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand-green/50">
            Category
          </p>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${
                  activeCategory === cat
                    ? 'bg-brand-green text-cream-text'
                    : 'border border-card-border bg-card text-brand-green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleParam('virtual')}
            className={`shrink-0 rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
              virtualOnly ? 'bg-gold text-gold-text' : 'border border-card-border bg-cream text-brand-green/70'
            }`}
          >
            🌐 Virtual only
          </button>
          <button
            onClick={() => toggleParam('verified')}
            className={`shrink-0 rounded-pill px-4 py-2 text-xs font-bold transition-colors ${
              verifiedOnly ? 'bg-gold text-gold-text' : 'border border-card-border bg-cream text-brand-green/70'
            }`}
          >
            ✓ Verifies service hours
          </button>
          {anyFilter && (
            <button
              onClick={clearAll}
              className="rounded-pill border border-card-border px-3 py-1.5 text-xs font-bold text-coral"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 rounded-card border border-card-border bg-cream p-3 text-xs text-brand-green/60">
        Age requirements can change. Always verify the current requirement on each
        organization's website before signing up.
      </p>

      <p className="mt-4 text-sm font-semibold text-brand-green/50">
        {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
      </p>

      <div className="mt-3 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="rounded-card border border-card-border bg-card p-6 text-center shadow-card">
            <p className="text-brand-green/60">Nothing matches yet — try clearing a filter.</p>
            <button
              onClick={clearAll}
              className="mt-3 rounded-pill bg-brand-green px-5 py-2 text-sm font-bold text-cream-text"
            >
              Clear filters
            </button>
          </div>
        )}
        {filtered.map((opp) => (
          <DirectoryCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  )
}
