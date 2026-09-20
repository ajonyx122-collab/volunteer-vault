'use client'

import { useState } from 'react'
import Link from 'next/link'

// Interactive "browse by state" panel for the /volunteer hub. Instead of one
// long wall of every city, you get a tidy grid of states plus a big "from
// anywhere" card for online roles; tap a state to reveal its cities. All the
// city links still point at the same /volunteer/[slug] landing pages.
export default function StateExplorer({ groups, onlineCount = 0 }) {
  const [openState, setOpenState] = useState(groups[0]?.state ?? null)
  const active = groups.find((g) => g.state === openState) ?? null

  return (
    <div className="mt-4">
      {/* From anywhere / online */}
      {onlineCount > 0 && (
        <Link
          href="/browse?remote=1"
          className="group flex items-center gap-4 rounded-card border border-brand-green bg-brand-green p-4 shadow-card transition-transform hover:-translate-y-0.5"
        >
          <span className="text-3xl" aria-hidden>
            🌐
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-extrabold text-cream-text">
              Volunteer from anywhere
            </span>
            <span className="text-sm text-cream-muted">
              {onlineCount} online role{onlineCount === 1 ? '' : 's'} you can do from home — no car needed.
            </span>
          </span>
          <span className="shrink-0 font-bold text-gold transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}

      {/* State picker */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {groups.map((g) => {
          const isOpen = g.state === openState
          return (
            <button
              key={g.state}
              onClick={() => setOpenState(isOpen ? null : g.state)}
              aria-expanded={isOpen}
              className={`flex items-center justify-between gap-2 rounded-card border-2 p-3 text-left transition-all hover:-translate-y-0.5 ${
                isOpen
                  ? 'border-gold bg-category-food-bg shadow-pop-soft'
                  : 'border-card-border bg-card shadow-card'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-display font-bold text-brand-green">
                  {g.label}
                </span>
                <span className="text-xs font-semibold text-brand-green/50">
                  {g.cities.length} cit{g.cities.length === 1 ? 'y' : 'ies'} · {g.total}
                </span>
              </span>
              <span
                className={`shrink-0 text-brand-green/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
          )
        })}
      </div>

      {/* Cities for the open state */}
      {active && (
        <div className="mt-4 rounded-card border border-card-border bg-cream p-4">
          <p className="mb-3 text-sm font-extrabold text-brand-green">
            {active.label}{' '}
            <span className="font-semibold text-brand-green/40">· {active.total} opportunities</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {active.cities.map((c) => (
              <Link
                key={c.slug}
                href={`/volunteer/${c.slug}`}
                className="rounded-pill border border-card-border bg-card px-4 py-2 text-sm font-bold text-brand-green shadow-card transition-transform hover:scale-105"
              >
                📍 {c.city}{' '}
                <span className="font-semibold text-brand-green/40">· {c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
