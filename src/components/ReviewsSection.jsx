import { useState } from 'react'
import { getReviewsForOpportunity } from '../data/mockData'

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
            <div
              key={photo.id}
              className="flex h-16 w-16 items-center justify-center rounded-card text-2xl"
              style={{ backgroundColor: photo.color }}
            >
              {photo.url ? (
                <img src={photo.url} alt="" className="h-full w-full rounded-card object-cover" />
              ) : (
                photo.emoji
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewsSection({ opportunityId }) {
  const [localReviews, setLocalReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [ratings, setRatings] = useState({ organized: 0, welcoming: 0, impactful: 0 })
  const [quote, setQuote] = useState('')
  const [tip, setTip] = useState('')
  const [photos, setPhotos] = useState([])

  const seedReviews = getReviewsForOpportunity(opportunityId)
  const allReviews = [...localReviews, ...seedReviews]
  const averages =
    allReviews.length === 0
      ? null
      : {
          count: allReviews.length,
          organized: allReviews.reduce((sum, r) => sum + r.ratings.organized, 0) / allReviews.length,
          welcoming: allReviews.reduce((sum, r) => sum + r.ratings.welcoming, 0) / allReviews.length,
          impactful: allReviews.reduce((sum, r) => sum + r.ratings.impactful, 0) / allReviews.length,
        }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files ?? [])
    const newPhotos = files.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      url: URL.createObjectURL(file),
      color: '#EDE6D4',
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLocalReviews((prev) => [
      {
        id: `local-${Date.now()}`,
        opportunityId,
        reviewerName: 'You',
        date: new Date().toISOString(),
        ratings,
        quote,
        tip,
        photos,
      },
      ...prev,
    ])
    setRatings({ organized: 0, welcoming: 0, impactful: 0 })
    setQuote('')
    setTip('')
    setPhotos([])
    setShowForm(false)
  }

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
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
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          {showForm ? 'Cancel' : 'Leave a review'}
        </button>
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
          <div>
            <label className="inline-block cursor-pointer rounded-pill border border-card-border px-4 py-2 text-sm font-bold text-brand-green hover:bg-cream">
              📷 Add photos
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </label>
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((p) => (
                  <img key={p.id} src={p.url} alt="" className="h-16 w-16 rounded-card object-cover" />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="mt-1 self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            Post review
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {allReviews.length === 0 && (
          <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
            No reviews yet — be the first to share how it went.
          </p>
        )}
        {allReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
