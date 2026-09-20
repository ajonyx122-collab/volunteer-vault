'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { US_STATES } from '../data/mockData'
import { isRemote, stateOf } from '../lib/opportunityFilters'
import { opportunityPath } from '../lib/opportunityUrls'

// A playful "pick one for me" that respects where the person actually is:
// anywhere, online-only (great if they can't travel), or in their own state.
export default function SurpriseMe({ opportunities }) {
  const router = useRouter()
  const [mode, setMode] = useState('any') // any | online | state
  const [stateF, setStateF] = useState('')
  const [err, setErr] = useState('')

  const MODES = [
    { id: 'any', label: '🎲 Anywhere' },
    { id: 'online', label: '🌐 Online' },
    { id: 'state', label: '📍 My state' },
  ]

  function go() {
    setErr('')
    let pool = opportunities
    if (mode === 'online') pool = opportunities.filter(isRemote)
    else if (mode === 'state') {
      if (!stateF) {
        setErr('Pick your state first.')
        return
      }
      pool = opportunities.filter((o) => !isRemote(o) && stateOf(o) === stateF)
    }
    if (!pool.length) {
      setErr(
        mode === 'state'
          ? 'No in-person listings there yet — try Online or Anywhere.'
          : 'Nothing to pick from right now.',
      )
      return
    }
    router.push(opportunityPath(pool[Math.floor(Math.random() * pool.length)]))
  }

  return (
    <div className="mt-6 rounded-card border-2 border-dashed border-card-border bg-cream p-5 text-center">
      <p className="font-display text-lg font-extrabold text-brand-green">🎲 Feeling lucky?</p>
      <p className="mt-0.5 text-xs text-brand-green/60">
        We'll pick one for you — near you, online, or anywhere.
      </p>

      <div className="mt-3 inline-flex flex-wrap justify-center gap-1 rounded-pill border border-card-border bg-card p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id)
              setErr('')
            }}
            className={`rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
              mode === m.id ? 'bg-brand-green text-cream-text' : 'text-brand-green/70 hover:bg-cream'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'state' && (
        <div className="mt-3">
          <select
            value={stateF}
            onChange={(e) => {
              setStateF(e.target.value)
              setErr('')
            }}
            className="rounded-pill border border-card-border bg-card px-4 py-2 text-sm font-semibold text-brand-green outline-none"
          >
            <option value="">Choose your state…</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={go}
          className="hover-wiggle inline-flex items-center gap-2 rounded-pill bg-coral px-7 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
        >
          Surprise me →
        </button>
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-coral">{err}</p>}
    </div>
  )
}
