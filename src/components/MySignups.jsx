'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionTitle from './SectionTitle'
import { fetchMySignups, cancelRsvp } from '../lib/api'

function formatWhen(startsAt) {
  const date = new Date(startsAt)
  return (
    date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  )
}

// Owner-only: what you've RSVP'd to. Never shown on the public vault.
export default function MySignups({ userId }) {
  const [signups, setSignups] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    fetchMySignups(userId).then(setSignups).catch(() => setSignups([]))
  }, [userId])

  async function handleCancel(signup) {
    setBusyId(signup.signupId)
    try {
      await cancelRsvp(userId, signup.opportunityId)
      setSignups((prev) => prev.filter((s) => s.signupId !== signup.signupId))
    } catch {
      // leave the row; a refresh will resolve the truth
    }
    setBusyId(null)
  }

  if (!signups) return null

  const upcoming = signups.filter(
    (s) => s.status === 'rsvp' && new Date(s.startsAt) >= new Date(Date.now() - 24 * 3600 * 1000),
  )

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <SectionTitle kicker="📅 On your calendar" title="Coming up" />
      <div className="mt-6 flex flex-col gap-3">
        {upcoming.length === 0 && (
          <p className="rounded-card border-2 border-dashed border-brand-green/40 bg-card p-5 text-sm text-brand-green/60">
            Nothing on the calendar —{' '}
            <Link href="/browse" className="font-bold text-coral hover:underline">
              find your next shift
            </Link>
            . Your streak will thank you.
          </p>
        )}
        {upcoming.map((s) => (
          <div
            key={s.signupId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-brand-green bg-card p-4 shadow-pop-soft"
          >
            <div className="min-w-0">
              <Link
                href={s.href}
                className="font-bold text-brand-green hover:underline"
              >
                {s.title}
              </Link>
              <p className="truncate text-sm text-brand-green/60">
                {s.orgName} · {formatWhen(s.startsAt)}
                {s.place ? ` · ${s.isOnline ? '🌐 ' : ''}${s.place}` : ''}
              </p>
            </div>
            <button
              onClick={() => handleCancel(s)}
              disabled={busyId === s.signupId}
              className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-brand-green/60 hover:text-coral disabled:opacity-50"
            >
              {busyId === s.signupId ? '...' : "Can't make it"}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
