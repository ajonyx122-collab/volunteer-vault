'use client'

import { useEffect, useState } from 'react'
import { getSavedIds, toggleSaved } from '../lib/saved'

// Heart toggle to save an opportunity for later (localStorage-backed, no login
// needed). Renders unsaved on the server / first paint, then syncs on mount so
// there's no hydration mismatch.
export default function SaveButton({ id, className = '' }) {
  const [saved, setSaved] = useState(false)
  const [pop, setPop] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(getSavedIds().includes(id))
    sync()
    window.addEventListener('vv-saved-change', sync)
    return () => window.removeEventListener('vv-saved-change', sync)
  }, [id])

  function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    const now = toggleSaved(id)
    setSaved(now)
    if (now) {
      setPop(true)
      setTimeout(() => setPop(false), 350)
    }
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      title={saved ? 'Saved — tap to remove' : 'Save for later'}
      className={`grid h-9 w-9 place-items-center rounded-full border border-card-border bg-card text-lg shadow-card transition-transform hover:scale-110 ${
        pop ? 'scale-125' : ''
      } ${className}`}
    >
      <span aria-hidden>{saved ? '❤️' : '🤍'}</span>
    </button>
  )
}
