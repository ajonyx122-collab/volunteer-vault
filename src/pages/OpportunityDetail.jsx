import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import { CATEGORY_STYLES } from '../components/categoryStyles'
import {
  fetchOpportunity,
  fetchMySignup,
  rsvp,
  cancelRsvp,
  reportOpportunity,
  fetchMyHourLog,
  checkInWithCode,
  requestHours,
} from '../lib/api'
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

// Never render a blank "Where". Fall back through the most specific location we
// know to a friendly nationwide/worldwide label.
function locationLabel(o) {
  if (o.isOnline || o.remote || o.org?.remote) return '🌐 Online — join from anywhere'
  const parts = [o.city || o.org?.city, o.state || o.org?.state].filter(Boolean)
  if (parts.length) return parts.join(', ')
  if (o.address) return o.address
  if (o.org?.international) return '🌍 Multiple locations (worldwide)'
  return '📍 Multiple locations (nationwide)'
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reportState, setReportState] = useState('idle') // idle | asking | sent
  const [hourLog, setHourLog] = useState(null)
  const [code, setCode] = useState('')
  const [codeState, setCodeState] = useState({ busy: false, error: '' })
  const [rsvpError, setRsvpError] = useState('')

  useEffect(() => {
    fetchOpportunity(id)
      .then(setOpportunity)
      .catch(() => setOpportunity(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    fetchMySignup(user.id, id).then((signup) => setJoined(!!signup))
    fetchMyHourLog(user.id, id).then(setHourLog)
  }, [user, id])

  async function handleCode(e) {
    e.preventDefault()
    setCodeState({ busy: true, error: '' })
    try {
      await checkInWithCode(id, code)
      setHourLog({ hours: opportunity.durationHours, status: 'verified' })
      setCode('')
      setCodeState({ busy: false, error: '' })
    } catch (err) {
      setCodeState({ busy: false, error: err.message ?? 'That code did not work.' })
    }
  }

  async function handleRequestHours() {
    setCodeState({ busy: true, error: '' })
    try {
      await requestHours(user.id, id, opportunity.durationHours)
      setHourLog({ hours: opportunity.durationHours, status: 'pending' })
      setCodeState({ busy: false, error: '' })
    } catch {
      setCodeState({ busy: false, error: "Couldn't send the request — try again." })
    }
  }

  async function handleRsvp() {
    if (!user) {
      navigate('/signup')
      return
    }
    setBusy(true)
    setRsvpError('')
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
    } catch (err) {
      // e.g. two people raced for the last spot, or a double-click raced the
      // unique constraint — either way, refetch the real state from the server
      // rather than trusting our optimistic guess.
      const [signup, fresh] = await Promise.all([fetchMySignup(user.id, id), fetchOpportunity(id)])
      setJoined(!!signup)
      if (fresh) setOpportunity(fresh)
      if (err.message?.includes('full')) {
        setRsvpError("Just filled up — someone beat you to the last spot.")
      }
    }
    setBusy(false)
  }

  async function handleReport(reason) {
    try {
      await reportOpportunity(id, user?.id ?? null, reason)
    } catch {
      // report table racing a fresh deploy — still show sent so users aren't stuck
    }
    setReportState('sent')
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
  const isExternal = !!opportunity.externalUrl
  const externalHref = isExternal
    ? opportunity.externalUrl.startsWith('http')
      ? opportunity.externalUrl
      : `https://${opportunity.externalUrl}`
    : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/browse" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to browse
      </Link>

      {/* Hero banner: real photo once an org uploads one, warm category art meanwhile */}
      <div
        className={`mt-4 flex h-44 items-center justify-center overflow-hidden rounded-card ${
          CATEGORY_STYLES[opportunity.category]?.chip ?? 'bg-cream'
        }`}
      >
        {opportunity.org?.imageUrl ? (
          <img src={opportunity.org.imageUrl} alt={opportunity.org.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-7xl" aria-hidden>
            {category?.icon ?? '💚'}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl">{category?.icon}</span>
            <h1 className="font-display text-3xl font-extrabold text-brand-green">{opportunity.title}</h1>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {opportunity.org?.verified && <VerifiedBadge verified />}
            {opportunity.isOnline && (
              <span className="rounded-pill bg-category-tech-bg px-3 py-1 text-xs font-bold text-category-tech-text">
                🌐 Online
              </span>
            )}
            {opportunity.vibeRating != null && (
              <span className="text-sm font-bold text-gold-text">★ {opportunity.vibeRating} vibe rating</span>
            )}
            {opportunity.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-pill bg-category-animals-bg px-3 py-1 text-xs font-bold text-category-animals-text"
              >
                {tag}
              </span>
            ))}
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
              <p className="text-brand-green/70">
                {opportunity.isOngoing ? 'Ongoing — start anytime' : formatWhen(opportunity.startsAt)}
              </p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Duration</p>
              <p className="text-brand-green/70">
                {opportunity.hoursEstimate ?? (opportunity.isOngoing ? 'Flexible' : `${opportunity.durationHours} hrs`)}
              </p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Where</p>
              <p className="text-brand-green/70">{locationLabel(opportunity)}</p>
            </div>
            <div>
              <p className="font-bold text-brand-green">Min age</p>
              <p className="text-brand-green/70">
                {opportunity.minAge > 0 ? `${opportunity.minAge}+` : 'All ages'}
              </p>
            </div>
            {!isExternal && (
              <div>
                <p className="font-bold text-brand-green">Spots</p>
                <p className="text-brand-green/70">{spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}</p>
              </div>
            )}
            <div>
              <p className="font-bold text-brand-green">Hosted by</p>
              <p className="text-brand-green/70">{opportunity.org?.name}</p>
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col gap-4 md:w-72">
          {isExternal ? (
            <div className="rounded-card border border-card-border bg-card p-5 text-center shadow-card">
              <p className="font-display text-lg font-extrabold text-brand-green">Register with {opportunity.org?.name}</p>
              <p className="mt-1 text-xs text-brand-green/60">
                This opportunity is hosted on the organization's own site. Sign up there to get started.
              </p>
              <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
              >
                Register on their site →
              </a>
              <p className="mt-3 rounded-card bg-cream px-3 py-2 text-xs text-brand-green/60">
                Heads up: hours from external programs are tracked on that org's site, not verified
                through VolunteerVault.
              </p>
            </div>
          ) : (
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
              {rsvpError && <p className="mt-2 text-xs font-semibold text-coral">{rsvpError}</p>}
              <p className="mt-2 text-xs text-brand-green/50">
                {user
                  ? 'No-shows hurt your streak, so only RSVP if you can make it.'
                  : 'You need an account to RSVP — joining is free.'}
              </p>
            </div>
          )}

          {user && joined && !isExternal && (
            <div className="rounded-card border border-card-border bg-card p-5 shadow-card">
              <p className="font-bold text-brand-green">Your hours</p>
              {hourLog?.status === 'verified' ? (
                <p className="mt-2 rounded-pill bg-category-environment-bg px-3 py-2 text-center text-sm font-bold text-category-environment-text">
                  ✓ {hourLog.hours} hrs verified — they're in your vault
                </p>
              ) : hourLog?.status === 'pending' ? (
                <p className="mt-2 rounded-pill bg-card-border px-3 py-2 text-center text-sm font-bold text-brand-green/60">
                  ⏳ {hourLog.hours} hrs requested — waiting on the org
                </p>
              ) : (
                <>
                  <form onSubmit={handleCode} className="mt-2 flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Event code"
                      maxLength={6}
                      className="w-full min-w-0 rounded-pill border border-card-border px-4 py-2 text-center text-sm font-bold tracking-widest outline-none"
                    />
                    <button
                      type="submit"
                      disabled={codeState.busy || code.length < 6}
                      className="shrink-0 rounded-pill bg-brand-green px-4 py-2 text-sm font-bold text-cream-text shadow-soft disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-brand-green/50">
                    Get the 6-character code from the organizer at the event — hours verify instantly.
                  </p>
                  <button
                    onClick={handleRequestHours}
                    disabled={codeState.busy}
                    className="mt-2 w-full rounded-pill border border-card-border px-4 py-2 text-xs font-bold text-brand-green/70 hover:bg-cream disabled:opacity-50"
                  >
                    No code? Request hours from the org
                  </button>
                </>
              )}
              {codeState.error && (
                <p className="mt-2 text-xs font-semibold text-coral">{codeState.error}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 rounded-card border border-card-border bg-card p-5 shadow-card">
            <OrgAvatar org={opportunity.org} size="md" />
            <div className="min-w-0">
              <p className="font-bold text-brand-green">{opportunity.org?.name}</p>
              <p className="mt-1 text-sm text-brand-green/70">{opportunity.org?.description}</p>
              {opportunity.org?.website && (
                <a
                  href={
                    opportunity.org.website.startsWith('http')
                      ? opportunity.org.website
                      : `https://${opportunity.org.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block truncate text-sm font-bold text-coral hover:underline"
                >
                  🌐 Visit their website
                </a>
              )}
            </div>
          </div>

          <div className="text-center">
            {reportState === 'idle' && (
              <button
                onClick={() => setReportState('asking')}
                className="text-xs font-semibold text-brand-green/40 hover:text-coral"
              >
                🚩 Something wrong with this listing?
              </button>
            )}
            {reportState === 'asking' && (
              <div className="rounded-card border border-card-border bg-card p-4 text-left shadow-card">
                <p className="text-xs font-bold text-brand-green">What's wrong?</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {['Spam or fake', 'Inappropriate content', 'Unsafe for minors', 'Wrong information'].map(
                    (reason) => (
                      <button
                        key={reason}
                        onClick={() => handleReport(reason)}
                        className="rounded-pill border border-card-border px-3 py-1.5 text-left text-xs font-semibold text-brand-green hover:bg-cream"
                      >
                        {reason}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
            {reportState === 'sent' && (
              <p className="text-xs font-semibold text-brand-green/60">
                ✓ Thanks — we'll take a look.
              </p>
            )}
          </div>
        </aside>
      </div>

      <ReviewsSection opportunityId={opportunity.id} />
    </div>
  )
}
