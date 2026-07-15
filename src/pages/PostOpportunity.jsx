import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, TAG_OPTIONS, US_STATES } from '../data/mockData'
import { useAuth } from '../lib/AuthContext'
import { fetchMyOrganization, createOpportunity } from '../lib/api'
import OrgAvatar from '../components/OrgAvatar'

const emptyDraft = {
  title: '',
  category: CATEGORIES[0].id,
  description: '',
  dates: [''],
  isOngoing: false,
  durationHours: 2,
  address: '',
  city: '',
  state: '',
  zip: '',
  isOnline: false,
  tags: [],
  capacity: 20,
  minAge: 12,
}

function friendlyError(err) {
  const msg = err?.message ?? ''
  if (msg.includes('does not exist') || msg.includes('schema cache')) {
    return 'The database needs its latest update — paste the newest SQL update in the Supabase SQL editor, run it, then try again.'
  }
  return msg || 'Could not publish the listing — check your connection and try again.'
}

export default function PostOpportunity() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [org, setOrg] = useState(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    if (!user) {
      setOrgLoading(false)
      return
    }
    fetchMyOrganization(user.id)
      .then(setOrg)
      .finally(() => setOrgLoading(false))
  }, [user])

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTag(tag) {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  function updateDate(index, value) {
    setDraft((prev) => {
      const dates = [...prev.dates]
      dates[index] = value
      return { ...prev, dates }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const dates = draft.dates.filter(Boolean)
    if (!draft.isOngoing && dates.length === 0) {
      setError('Pick at least one date.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createOpportunity(org.id, {
        ...draft,
        dates: draft.isOngoing ? [new Date().toISOString()] : dates,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err))
      setBusy(false)
    }
  }

  if (loading || orgLoading) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading...</div>
  }

  if (!user || !org) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Post an opportunity</h1>
        <p className="text-brand-green/70">
          {user
            ? 'Set up your organization first — it takes one step.'
            : 'Log in with your organization account to post opportunities.'}
        </p>
        <Link
          to={user ? '/dashboard' : '/login'}
          className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          {user ? 'Go to dashboard' : 'Log in'}
        </Link>
      </div>
    )
  }

  const sessionCount = draft.isOngoing ? 1 : draft.dates.filter(Boolean).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/dashboard" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <OrgAvatar org={org} size="md" />
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-green">Post an opportunity</h1>
          <p className="text-sm text-brand-green/60">for {org.name}</p>
        </div>
      </div>

      <button
        onClick={() => setShowExample((v) => !v)}
        className="mt-4 rounded-pill border border-card-border bg-card px-4 py-2 text-xs font-bold text-brand-green shadow-card hover:bg-cream"
      >
        {showExample ? 'Hide example ▲' : 'New here? See what a good listing looks like ▼'}
      </button>

      {showExample && (
        <div className="mt-3 rounded-card border-2 border-dashed border-gold bg-card p-5 shadow-card sm:p-6">
          <span className="rounded-pill bg-gold px-3 py-1 text-xs font-bold text-gold-text">
            📋 EXAMPLE — not a real listing
          </span>
          <p className="mt-3 font-display text-lg font-bold text-brand-green">
            Saturday Shelter Support Shift
          </p>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div>
              <dt className="font-bold text-brand-green/60">Category</dt>
              <dd className="text-brand-green">🐾 Animals</dd>
            </div>
            <div>
              <dt className="font-bold text-brand-green/60">
                Description — say exactly what a volunteer will spend their time doing, not just what
                your org does in general.
              </dt>
              <dd className="mt-1 leading-relaxed text-brand-green">
                "Volunteers help walk dogs, clean kennels, and socialize cats during our busiest
                adoption hours. No experience needed — a staff member walks you through everything
                in the first 15 minutes. Closed-toe shoes required; we'll provide gloves and aprons.
                Great for first-timers and regulars alike, and a good pick if you're coming with a
                club or a group of friends."
              </dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-green/60">When</dt>
                <dd className="text-brand-green">Saturdays, 10am–12pm (recurring — add every date)</dd>
              </div>
              <div>
                <dt className="font-bold text-brand-green/60">Capacity</dt>
                <dd className="text-brand-green">8 volunteers per shift</dd>
              </div>
            </div>
            <div>
              <dt className="font-bold text-brand-green/60">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {['no experience needed', 'good for crews', 'animal handling', 'physical work'].map((t) => (
                  <span
                    key={t}
                    className="rounded-pill bg-cream px-3 py-1 text-xs font-bold text-brand-green"
                  >
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-green/50">
            Runs every week with no end date in sight? Check "This is ongoing" in the When section
            below instead of adding dates one by one.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
        {/* The basics */}
        <Section number="1" title="The basics">
          <input
            required
            placeholder="Title — say what volunteers will actually do"
            value={draft.title}
            onChange={(e) => updateDraft('title', e.target.value)}
            className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
          />
          <select
            value={draft.category}
            onChange={(e) => updateDraft('category', e.target.value)}
            className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none sm:max-w-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <textarea
            required
            placeholder="Description — what to expect, what to bring, why it matters"
            value={draft.description}
            onChange={(e) => updateDraft('description', e.target.value)}
            rows={4}
            className="rounded-card border border-card-border px-4 py-3 text-sm outline-none"
          />
        </Section>

        {/* When */}
        <Section
          number="2"
          title="When"
          hint="Recurring or multi-day? Add every date — each one becomes its own session volunteers can join. Runs for weeks or months with no fixed schedule? Mark it ongoing instead."
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-green">
            <input
              type="checkbox"
              checked={draft.isOngoing}
              onChange={(e) => updateDraft('isOngoing', e.target.checked)}
              className="h-4 w-4 accent-brand-green"
            />
            🔁 This is ongoing — no need to pick exact dates
          </label>

          {!draft.isOngoing && (
            <div className="flex flex-col gap-2">
              {draft.dates.map((date, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    required
                    type="datetime-local"
                    value={date}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                  />
                  {draft.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => updateDraft('dates', draft.dates.filter((_, di) => di !== i))}
                      aria-label="Remove date"
                      className="rounded-pill border border-card-border px-3 py-1.5 text-sm font-bold text-coral"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            {!draft.isOngoing && (
              <button
                type="button"
                onClick={() => updateDraft('dates', [...draft.dates, ''])}
                className="self-start rounded-pill border border-card-border bg-card px-4 py-2 text-xs font-bold text-brand-green"
              >
                + Add another date
              </button>
            )}
            <label className="flex items-center gap-2 text-xs font-semibold text-brand-green/70">
              Duration (hours)
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={draft.durationHours}
                onChange={(e) => updateDraft('durationHours', e.target.value)}
                className="w-20 rounded-pill border border-card-border px-3 py-2 text-sm text-brand-green outline-none"
              />
            </label>
          </div>
        </Section>

        {/* Where */}
        <Section number="3" title="Where">
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-green">
            <input
              type="checkbox"
              checked={draft.isOnline}
              onChange={(e) => updateDraft('isOnline', e.target.checked)}
              className="h-4 w-4 accent-brand-green"
            />
            🌐 This is an online / virtual opportunity
          </label>
          {!draft.isOnline && (
            <>
              <input
                required
                placeholder="Street address / meeting spot"
                value={draft.address}
                onChange={(e) => updateDraft('address', e.target.value)}
                className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => updateDraft('city', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <select
                  value={draft.state}
                  onChange={(e) => updateDraft('state', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                >
                  <option value="">State</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="ZIP"
                  inputMode="numeric"
                  maxLength={5}
                  value={draft.zip}
                  onChange={(e) => updateDraft('zip', e.target.value.replace(/\D/g, ''))}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <p className="text-xs text-brand-green/50">
                City, state, and ZIP power the search filters — fill them in so locals can find you.
              </p>
            </>
          )}
        </Section>

        {/* Details */}
        <Section number="4" title="The details">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/70">
              Capacity (how many volunteers)
              <input
                type="number"
                min="1"
                value={draft.capacity}
                onChange={(e) => updateDraft('capacity', e.target.value)}
                className="rounded-pill border border-card-border px-4 py-2.5 text-sm text-brand-green outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/70">
              Minimum age
              <input
                type="number"
                min="0"
                value={draft.minAge}
                onChange={(e) => updateDraft('minAge', e.target.value)}
                className="rounded-pill border border-card-border px-4 py-2.5 text-sm text-brand-green outline-none"
              />
            </label>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-green/60">Tags — help the right people find it</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                    draft.tags.includes(tag)
                      ? 'bg-brand-green text-cream-text'
                      : 'border border-card-border bg-cream text-brand-green/70'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-coral px-8 py-3.5 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
        >
          {busy
            ? 'Publishing...'
            : sessionCount > 1
              ? `Publish ${sessionCount} sessions`
              : 'Publish opportunity'}
        </button>
      </form>
    </div>
  )
}

function Section({ number, title, hint, children }) {
  return (
    <section className="rounded-card border border-card-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral font-display text-sm font-extrabold text-cream-text">
          {number}
        </span>
        <h2 className="font-display text-lg font-extrabold text-brand-green">{title}</h2>
      </div>
      {hint && <p className="mt-2 text-xs text-brand-green/60">{hint}</p>}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}
