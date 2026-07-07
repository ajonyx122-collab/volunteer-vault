import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchReviews, addReview } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const RATING_LABELS = [
  { key: 'organized', label: 'Organized' },
  { key: 'welcoming', label: 'Welcoming' },
  { key: 'impactful', label: 'Impactful' },
]

function Stars({ value, onChange }) {
  const interactive = typeof onChange === 'function'
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange(n) : undefined}
          className={`${interactive ? 'cursor-pointer' : ''} ${
            n <= Math.round(value) ? 'text-gold' : 'text-card-border'
          }`}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-brand-green">{review.reviewerName}</p>
        <p className="text-xs text-brand-green/50">
          {new Date(review.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {RATING_LABELS.map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1 text-brand-green/70">
            {label} <Stars value={review.ratings[key]} />
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm italic text-brand-green/80">“{review.quote}”</p>
      {review.tip && <p className="mt-1 text-xs text-brand-green/60">💡 {review.tip}</p>}

      {review.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.photos.map((photo) => (
            <img key={photo.id} src={photo.url} alt="" className="h-16 w-16 rounded-card object-cover" />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewsSection({ opportunityId }) {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [ratings, setRatings] = useState({ organized: 0, welcoming: 0, impactful: 0 })
  const [quote, setQuote] = useState('')
  const [tip, setTip] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchReviews(opportunityId).then(setReviews).catch(() => setReviews([]))
  }, [opportunityId])

  const averages =
    reviews.length === 0
      ? null
      : {
          count: reviews.length,
          organized: reviews.reduce((s, r) => s + r.ratings.organized, 0) / reviews.length,
          welcoming: reviews.reduce((s, r) => s + r.ratings.welcoming, 0) / reviews.length,
          impactful: reviews.reduce((s, r) => s + r.ratings.impactful, 0) / reviews.length,
        }

  async function handleSubmit(e) {
    e.preventDefault()
    if (ratings.organized === 0 || ratings.welcoming === 0 || ratings.impactful === 0) {
      setError('Tap the stars to rate all three vibes first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const saved = await addReview({
        opportunityId,
        userId: user.id,
        reviewerName: profile?.display_name ?? 'Volunteer',
        ratings,
        quote,
        tip,
      })
      setReviews((prev) => [saved, ...prev])
      setRatings({ organized: 0, welcoming: 0, impactful: 0 })
      setQuote('')
      setTip('')
      setShowForm(false)
    } catch (err) {
      setError(err.message ?? 'Something went wrong — try again.')
    }
    setBusy(false)
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-brand-green">Reviews</h2>
          {averages && (
            <p className="mt-1 text-sm text-brand-green/60">
              Based on {averages.count} review{averages.count > 1 ? 's' : ''} ·{' '}
              {RATING_LABELS.map(({ key, label }) => `${label} ${averages[key].toFixed(1)}`).join(' · ')}
            </p>
          )}
        </div>
        {user ? (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            {showForm ? 'Cancel' : 'Leave a review'}
          </button>
        ) : (
          <Link
            to="/signup"
            className="rounded-pill border border-card-border bg-card px-5 py-2 text-sm font-bold text-brand-green hover:bg-cream"
          >
            Join to leave a review
          </Link>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 rounded-card border border-card-border bg-card p-5 shadow-card"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {RATING_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                {label}
                <Stars value={ratings[key]} onChange={(n) => setRatings((prev) => ({ ...prev, [key]: n }))} />
              </label>
            ))}
          </div>
          <textarea
            required
            placeholder="How'd it go? Be honest — future volunteers are counting on you."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className="rounded-card border border-card-border px-4 py-2 text-sm outline-none"
          />
          <input
            placeholder="Practical tip for next time (bring a hoodie, wear old shoes...)"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
          />
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
          >
            {busy ? 'Posting...' : 'Post review'}
          </button>
          <p className="text-xs text-brand-green/50">
            Photo uploads are coming soon — reviews save for real starting today.
          </p>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {reviews.length === 0 && (
          <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
            No reviews yet — be the first to share how it went.
          </p>
        )}
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
