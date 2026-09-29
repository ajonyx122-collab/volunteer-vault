'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSavedIds, toggleSaved } from '../lib/saved'
import { useAuth } from '../lib/AuthContext'

// Heart toggle to save an opportunity for later. Saving needs an account —
// logged-out visitors are sent to sign up and brought back here afterwards.
// Renders unsaved on the server / first paint, then syncs on mount so there's
// no hydration mismatch.
export default function SaveButton({ id, className = '' }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [saved, setSaved] = useState(false)
  const [pop, setPop] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(getSavedIds().includes(id))
    sync()
    window.addEventListener('vv-saved-change', sync)
    return () => window.removeEventListener('vv-saved-change', sync)
  }, [id])

  async function onClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push(`/signup?next=${encodeURIComponent(pathname)}&why=save`)
      return
    }
    if (!saved) {
      setPop(true)
      setTimeout(() => setPop(false), 350)
    }
    await toggleSaved(id, user.id)
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save for later'}
      title={!user ? 'Sign up free to save' : saved ? 'Saved — tap to remove' : 'Save for later'}
      className={`grid h-9 w-9 place-items-center rounded-full border border-card-border bg-card text-lg shadow-card transition-transform hover:scale-110 ${
        pop ? 'scale-125' : ''
      } ${className}`}
    >
      <span aria-hidden>{saved ? '❤️' : '🤍'}</span>
    </button>
  )
}
