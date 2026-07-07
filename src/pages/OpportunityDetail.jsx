import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import { fetchOpportunity, fetchMySignup, rsvp, cancelRsvp } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import VerifiedBadge from '../components/VerifiedBadge'
import OrgAvatar from '../components/OrgAvatar'
import ReviewsSection from '../components/ReviewsSection'

function formatWhen(startsAt) {
  const date = new Date(startsAt)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }) + ' · ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchOpportunity(id)
      .then(setOpportunity)
      .catch(() => setOpportunity(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    fetchMySignup(user.id, id).then((signup) => setJoined(!!signup))
  }, [user, id])

  async function handleRsvp() {
    if (!user) {
      navigate('/signup')
      return
    }
    setBusy(true)
    try {
      if (joined) {
        await cancelRsvp(user.id, id)
        setJoined(false)
        setOpportunity((o) => ({ ...o, spotsFilled: Math.max(0, o.spotsFilled - 1) }))
      } else {
        await rsvp(user.id, id)
        setJoined(true)
        setOpportunity((o) => ({ ...o, spotsFilled: o.spotsFilled + 1 }))
      }
    } catch {
      // e.g. double-click raced the unique constraint — refetch state
      const signup = await fetchMySignup(user.id, id)
      setJoined(!!signup)
    }
    setBusy(false)
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-brand-green/60">Loading...</div>
  }

  if (!opportunity) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-brand-green/70">This opportunity doesn't exist (or got un-listed).</p>
        <Link to="/browse" className="mt-4 inline-block font-bold text-coral hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  const category = getCategoryMeta(opportunity.category)
  const spotsLeft = opportunity.capacity - opportunity.spotsFilled
  const isFull = spotsLeft <= 0 && !joined

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/browse" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to browse
      </Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl">{category?.icon}</span>
            <h1 className="font-display text-3xl font-extrabold text-brand-green">{opportunity.title}</h1>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {opportunity.org?.verified && <VerifiedBadge verified />}
            {opportunity.vibeRating != null && (
              <span className="text-sm font-bold text-gold-text">★ {opportunity.vibeRating} vibe rating</span>
            )}
          </div>

          <p className="mt-6 text-brand-green/80">{opportunity.description}</p>

          {opportunity.reviewQuote && (
            <blockquote className="mt-6 rounded-card border border-card-border bg-card p-4 italic text-brand-green/70 shadow-card">
              “{opportunity.reviewQuote}”
            </blockquote>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-bold text-brand-green">When</p>
              <p className="text-brand-green/70">{formatWhen(opportunity.startsAt)}</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Duration</p>
              <p className="text-brand-green/70">{opportunity.durationHours} hrs</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Where</p>
              <p className="text-brand-green/70">{opportunity.address}</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Min age</p>
              <p className="text-brand-green/70">{opportunity.minAge}+</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Spots</p>
              <p className="text-brand-green/70">{spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Hosted by</p>
              <p className="text-brand-green/70">{opportunity.org?.name}</p>
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col gap-4 md:w-72">
          <div className="rounded-card border border-card-border bg-card p-5 text-center shadow-card">
            <p className="font-display text-2xl font-extrabold text-brand-green">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </p>
            <button
              disabled={isFull || busy}
              onClick={handleRsvp}
              className={`mt-4 w-full rounded-pill px-6 py-3 text-sm font-bold shadow-soft transition-transform ${
                joined
                  ? 'bg-category-environment-bg text-category-environment-text hover:scale-105'
                  : isFull
                    ? 'cursor-not-allowed bg-card-border text-brand-green/40'
                    : 'bg-coral text-cream-text hover:scale-105'
              }`}
            >
              {busy ? '...' : joined ? "You're in! 🎉 (tap to cancel)" : isFull ? 'Full' : 'Count me in'}
            </button>
            <p className="mt-2 text-xs text-brand-green/50">
              {user
                ? 'No-shows hurt your streak, so only RSVP if you can make it.'
                : 'You need an account to RSVP — joining is free.'}
            </p>
          </div>

          <div className="flex gap-3 rounded-card border border-card-border bg-card p-5 shadow-card">
            <OrgAvatar org={opportunity.org} size="md" />
            <div>
              <p className="font-bold text-brand-green">{opportunity.org?.name}</p>
              <p className="mt-1 text-sm text-brand-green/70">{opportunity.org?.description}</p>
            </div>
          </div>
        </aside>
      </div>

      <ReviewsSection opportunityId={opportunity.id} />
    </div>
  )
}
