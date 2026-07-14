import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, US_STATES } from '../data/mockData'
import { submitSuggestion, createCommunityOrg, createOpportunity } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const emptySuggestion = { orgName: '', website: '', notes: '', city: '', state: '', submitterEmail: '' }
const emptyQuickAdd = {
  name: '',
  organizerName: '',
  category: CATEGORIES[0].id,
  description: '',
  website: '',
  city: '',
  state: '',
  isOnline: false,
  eventDates: [''],
  headcount: 15,
  whatToBring: '',
}

export default function SuggestOpportunity({ onPosted, onOrganizeClick }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('org') // 'org' (existing place) | 'event' (one-time project you're running)
  const [suggestion, setSuggestion] = useState(emptySuggestion)
  const [quickAdd, setQuickAdd] = useState(emptyQuickAdd)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function updateSuggestion(field, value) {
    setSuggestion((prev) => ({ ...prev, [field]: value }))
  }
  function updateQuickAdd(field, value) {
    setQuickAdd((prev) => ({ ...prev, [field]: value }))
  }
  function updateEventDate(index, value) {
    setQuickAdd((prev) => {
      const eventDates = [...prev.eventDates]
      eventDates[index] = value
      return { ...prev, eventDates }
    })
  }

  async function handleSuggestSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await submitSuggestion(suggestion)
      setSent(true)
      setSuggestion(emptySuggestion)
    } catch {
      setError("Couldn't send that — check your connection and try again.")
    }
    setBusy(false)
  }

  // Signed-in volunteers add a real, immediately-visible listing (shown as
  // "Pending" until AJ verifies it — same honest badge every unverified org
  // gets) instead of dropping into a private review queue. Two shapes share
  // this one flow: flagging an existing place ("org" mode, always-open/
  // ongoing) and organizing your own project ("event" mode, with real
  // date(s), headcount, and what to bring — the Phase 3 community post).
  async function handleQuickAddSubmit(e) {
    e.preventDefault()
    const dates = mode === 'event' ? quickAdd.eventDates.filter(Boolean) : []
    if (mode === 'event' && dates.length === 0) {
      setError('Pick at least one date for your project.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const location = quickAdd.isOnline
        ? 'Online'
        : [quickAdd.city, quickAdd.state].filter(Boolean).join(', ')
      const org = await createCommunityOrg(user.id, {
        name: mode === 'event' ? quickAdd.organizerName : quickAdd.name,
        location,
        website: quickAdd.website,
      })
      await createOpportunity(org.id, {
        title: mode === 'event' ? quickAdd.name : `Volunteer with ${quickAdd.name}`,
        category: quickAdd.category,
        description: quickAdd.description,
        dates: mode === 'event' ? dates : [new Date().toISOString()],
        durationHours: 2,
        address: '',
        city: quickAdd.city,
        state: quickAdd.state,
        zip: '',
        isOnline: quickAdd.isOnline,
        isOngoing: mode === 'org',
        whatToBring: mode === 'event' ? quickAdd.whatToBring : '',
        tags: [],
        capacity: mode === 'event' ? Number(quickAdd.headcount) : 20,
        minAge: 0,
      })
      setSent(true)
      setQuickAdd(emptyQuickAdd)
      onPosted?.()
    } catch {
      setError("Couldn't add that — check your connection and try again.")
    }
    setBusy(false)
  }

  return (
    <section className="rounded-card border border-card-border bg-card p-5 shadow-card sm:p-6">
      {sent ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-brand-green">
            {user
              ? "🙌 It's live! You'll see it on Browse, marked Pending until we verify it."
              : "🙌 Thanks! We'll check it out and add it if it's a good fit."}
          </p>
          <button
            onClick={() => {
              setSent(false)
              setOpen(false)
            }}
            className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-brand-green"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-brand-green">
                💡 Know a place, or organizing your own project?
              </p>
              <p className="mt-0.5 text-sm text-brand-green/60">
                {user
                  ? "Add it and it's live right away, marked Pending until we verify it."
                  : "Suggest an organization and we'll add it to the directory."}
              </p>
            </div>
            {user ? (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    setMode('org')
                    setOpen(open && mode === 'org' ? false : true)
                  }}
                  className="rounded-pill bg-brand-green px-4 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
                >
                  {open && mode === 'org' ? 'Cancel' : '📍 Add a place'}
                </button>
                <button
                  onClick={() => {
                    if (onOrganizeClick) {
                      onOrganizeClick()
                      return
                    }
                    setMode('event')
                    setOpen(open && mode === 'event' ? false : true)
                  }}
                  className="rounded-pill bg-coral px-4 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
                >
                  {open && mode === 'event' && !onOrganizeClick ? 'Cancel' : '📅 Organize a project'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setOpen((v) => !v)}
                className="shrink-0 rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
              >
                {open ? 'Cancel' : 'Suggest an opportunity'}
              </button>
            )}
          </div>

          {open && user && (
            <form onSubmit={handleQuickAddSubmit} className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder={mode === 'event' ? "What's the project called?" : 'Organization or place name'}
                  value={quickAdd.name}
                  onChange={(e) => updateQuickAdd('name', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <select
                  value={quickAdd.category}
                  onChange={(e) => updateQuickAdd('category', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {mode === 'event' && (
                <input
                  required
                  placeholder="Your name or group name (who's running this?)"
                  value={quickAdd.organizerName}
                  onChange={(e) => updateQuickAdd('organizerName', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              )}

              <div>
                <textarea
                  required
                  placeholder={
                    mode === 'event'
                      ? 'What will you be doing? Cover what, where, who, and what to expect...'
                      : 'What would volunteers do there?'
                  }
                  value={quickAdd.description}
                  onChange={(e) => updateQuickAdd('description', e.target.value)}
                  rows={5}
                  className="w-full rounded-card border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                {mode === 'event' && (
                  <p className="mt-1 text-xs text-brand-green/50">
                    The more detail, the better — aim for 6-12 sentences so nobody's confused about
                    what showing up actually means.
                  </p>
                )}
              </div>

              {mode === 'event' && (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-brand-green/60">
                      When — recurring? Add every date, one listing per date.
                    </p>
                    {quickAdd.eventDates.map((date, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          required
                          type="datetime-local"
                          value={date}
                          onChange={(e) => updateEventDate(i, e.target.value)}
                          className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                        />
                        {quickAdd.eventDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateQuickAdd(
                                'eventDates',
                                quickAdd.eventDates.filter((_, di) => di !== i),
                              )
                            }
                            aria-label="Remove date"
                            className="rounded-pill border border-card-border px-3 py-1.5 text-sm font-bold text-coral"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateQuickAdd('eventDates', [...quickAdd.eventDates, ''])}
                      className="self-start rounded-pill border border-card-border bg-cream px-4 py-2 text-xs font-bold text-brand-green"
                    >
                      + Add another date
                    </button>
                  </div>
                  <label className="flex flex-col gap-1 text-xs font-bold text-brand-green/60 sm:w-56">
                    How many people can join
                    <input
                      required
                      type="number"
                      min="1"
                      value={quickAdd.headcount}
                      onChange={(e) => updateQuickAdd('headcount', e.target.value)}
                      className="rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
                    />
                  </label>
                </>
              )}

              <label className="flex items-center gap-2 text-sm font-semibold text-brand-green">
                <input
                  type="checkbox"
                  checked={quickAdd.isOnline}
                  onChange={(e) => updateQuickAdd('isOnline', e.target.checked)}
                  className="h-4 w-4 accent-brand-green"
                />
                🌐 This is online / virtual
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {!quickAdd.isOnline && (
                  <>
                    <input
                      required={mode === 'event'}
                      placeholder="City"
                      value={quickAdd.city}
                      onChange={(e) => updateQuickAdd('city', e.target.value)}
                      className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                    />
                    <select
                      value={quickAdd.state}
                      onChange={(e) => updateQuickAdd('state', e.target.value)}
                      className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="">State</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {mode === 'org' ? (
                  <input
                    type="url"
                    placeholder="Website (optional)"
                    value={quickAdd.website}
                    onChange={(e) => updateQuickAdd('website', e.target.value)}
                    className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                  />
                ) : (
                  <input
                    placeholder="What to bring (optional)"
                    value={quickAdd.whatToBring}
                    onChange={(e) => updateQuickAdd('whatToBring', e.target.value)}
                    className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                  />
                )}
              </div>
              {error && <p className="text-sm font-semibold text-coral">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="self-start rounded-pill bg-brand-green px-6 py-2.5 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
              >
                {busy
                  ? 'Adding...'
                  : mode === 'event'
                    ? quickAdd.eventDates.filter(Boolean).length > 1
                      ? `Post ${quickAdd.eventDates.filter(Boolean).length} dates`
                      : 'Post project'
                    : 'Add opportunity'}
              </button>
            </form>
          )}

          {open && !user && (
            <form onSubmit={handleSuggestSubmit} className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
              <p className="text-xs text-brand-green/50">
                <Link to="/login" className="font-bold text-coral hover:underline">
                  Log in
                </Link>{' '}
                to add it live right away — or send us a quick suggestion instead:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Organization name"
                  value={suggestion.orgName}
                  onChange={(e) => updateSuggestion('orgName', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <input
                  required
                  type="url"
                  placeholder="Website (https://...)"
                  value={suggestion.website}
                  onChange={(e) => updateSuggestion('website', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <textarea
                required
                placeholder="What do they do, and why should volunteers know about them?"
                value={suggestion.notes}
                onChange={(e) => updateSuggestion('notes', e.target.value)}
                rows={3}
                className="rounded-card border border-card-border px-4 py-2.5 text-sm outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="City (optional)"
                  value={suggestion.city}
                  onChange={(e) => updateSuggestion('city', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <select
                  value={suggestion.state}
                  onChange={(e) => updateSuggestion('state', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                >
                  <option value="">State (optional)</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={suggestion.submitterEmail}
                  onChange={(e) => updateSuggestion('submitterEmail', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              </div>
              {error && <p className="text-sm font-semibold text-coral">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="self-start rounded-pill bg-brand-green px-6 py-2.5 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
              >
                {busy ? 'Sending...' : 'Send suggestion'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  )
}
