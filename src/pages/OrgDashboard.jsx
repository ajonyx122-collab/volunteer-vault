import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, TAG_OPTIONS, US_STATES } from '../data/mockData'
import { useAuth } from '../lib/AuthContext'
import {
  fetchMyOrganization,
  createOrganization,
  updateOrganization,
  fetchOrgOpportunities,
  createOpportunity,
  fetchListingSignups,
  verifyAttendance,
} from '../lib/api'
import VerifiedBadge from '../components/VerifiedBadge'
import OrgAvatar from '../components/OrgAvatar'

const emptyDraft = {
  title: '',
  category: CATEGORIES[0].id,
  description: '',
  dates: [''],
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

export default function OrgDashboard() {
  const { user, loading } = useAuth()
  const [org, setOrg] = useState(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [myOpportunities, setMyOpportunities] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgLocation, setNewOrgLocation] = useState('')
  const [editingOrg, setEditingOrg] = useState(false)
  const [draftWebsite, setDraftWebsite] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!user) {
      setOrgLoading(false)
      return
    }
    fetchMyOrganization(user.id)
      .then(async (myOrg) => {
        setOrg(myOrg)
        if (myOrg) setMyOpportunities(await fetchOrgOpportunities(myOrg.id))
      })
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

  function addDate() {
    setDraft((prev) => ({ ...prev, dates: [...prev.dates, ''] }))
  }

  function removeDate(index) {
    setDraft((prev) => ({ ...prev, dates: prev.dates.filter((_, i) => i !== index) }))
  }

  async function handleCreateOrg(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createOrganization(user.id, { name: newOrgName, location: newOrgLocation })
      setOrg(created)
    } catch (err) {
      setError(err.message ?? 'Could not create the organization.')
    }
    setBusy(false)
  }

  function startEditingOrg() {
    setDraftWebsite(org.website ?? '')
    setDraftDescription(org.description ?? '')
    setEditingOrg(true)
  }

  async function handleSaveOrg(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await updateOrganization(org.id, {
        description: draftDescription,
        website: draftWebsite,
      })
      setOrg(updated)
      setEditingOrg(false)
    } catch (err) {
      setError(err.message ?? 'Could not save.')
    }
    setBusy(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const dates = draft.dates.filter(Boolean)
    if (dates.length === 0) {
      setError('Pick at least one date.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createOpportunity(org.id, { ...draft, dates })
      setMyOpportunities(await fetchOrgOpportunities(org.id))
      setDraft(emptyDraft)
      setShowForm(false)
    } catch (err) {
      setError(err.message ?? 'Could not publish the listing.')
    }
    setBusy(false)
  }

  if (loading || orgLoading) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading...</div>
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Org dashboard</h1>
        <p className="text-brand-green/70">Log in with your organization account to manage listings.</p>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105">
            Log in
          </Link>
          <Link to="/signup" className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105">
            Join free
          </Link>
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="text-center">
          <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-brand-green">Set up your organization</h1>
          <p className="mt-1 text-brand-green/70">One quick step and you can start posting opportunities.</p>
        </div>
        <form onSubmit={handleCreateOrg} className="mt-6 flex flex-col gap-3">
          <input
            required
            placeholder="Organization name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
          />
          <input
            required
            placeholder="City / area served"
            value={newOrgLocation}
            onChange={(e) => setNewOrgLocation(e.target.value)}
            className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
          />
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
          >
            {busy ? 'Creating...' : 'Create organization'}
          </button>
        </form>
      </div>
    )
  }

  const totalSignups = myOpportunities.reduce((sum, o) => sum + o.spotsFilled, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <OrgAvatar org={org} size="md" />
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold text-brand-green">{org.name}</h1>
            <VerifiedBadge verified={org.verified} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={editingOrg ? () => setEditingOrg(false) : startEditingOrg}
            className="rounded-pill border border-card-border bg-card px-5 py-2 text-sm font-bold text-brand-green shadow-card"
          >
            {editingOrg ? 'Cancel' : 'Org info'}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            {showForm ? 'Cancel' : '+ New opportunity'}
          </button>
        </div>
      </div>

      {org.website && !editingOrg && (
        <a
          href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-coral hover:underline"
        >
          🌐 {org.website}
        </a>
      )}

      {editingOrg && (
        <form
          onSubmit={handleSaveOrg}
          className="mt-4 flex flex-col gap-3 rounded-card border border-card-border bg-card p-5 shadow-card"
        >
          <h2 className="font-display text-lg font-bold text-brand-green">Organization info</h2>
          <label className="text-xs font-bold text-brand-green/60">
            Website — optional! Plenty of great projects don't have one
            <input
              placeholder="e.g. greenshore.org"
              value={draftWebsite}
              onChange={(e) => setDraftWebsite(e.target.value)}
              className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
            />
          </label>
          <label className="text-xs font-bold text-brand-green/60">
            Description
            <textarea
              rows={2}
              placeholder="What does your org do?"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              className="mt-1 w-full rounded-card border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
            />
          </label>
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Save org info'}
          </button>
        </form>
      )}

      {!org.verified && (
        <p className="mt-4 rounded-card border border-card-border bg-card p-4 text-sm text-brand-green/70 shadow-card">
          Your org shows as <span className="font-bold">Pending</span> until it's verified — verification
          reviews open up in Phase 2. Your listings are still live and searchable.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatBlock value={myOpportunities.length} label="Active listings" />
        <StatBlock value={totalSignups} label="Total signups" />
        <StatBlock value="Phase 2" label="QR check-in" />
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 rounded-card border border-card-border bg-card p-6 shadow-card"
        >
          <h2 className="font-display text-lg font-bold text-brand-green">New opportunity</h2>
          <input
            required
            placeholder="Title"
            value={draft.title}
            onChange={(e) => updateDraft('title', e.target.value)}
            className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
          />
          <select
            value={draft.category}
            onChange={(e) => updateDraft('category', e.target.value)}
            className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none sm:max-w-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          <div className="rounded-card border border-card-border bg-cream/50 p-4">
            <p className="text-xs font-bold text-brand-green/60">
              Dates — add more for recurring or multi-day events; each date becomes its own session
              volunteers can join
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {draft.dates.map((date, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    required
                    type="datetime-local"
                    value={date}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
                  />
                  {draft.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDate(i)}
                      aria-label="Remove date"
                      className="rounded-pill border border-card-border px-3 py-1 text-sm font-bold text-coral"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDate}
              className="mt-2 rounded-pill border border-card-border bg-card px-4 py-1.5 text-xs font-bold text-brand-green"
            >
              + Add another date
            </button>
          </div>

          <textarea
            required
            placeholder="Description"
            value={draft.description}
            onChange={(e) => updateDraft('description', e.target.value)}
            rows={3}
            className="rounded-card border border-card-border px-4 py-2 text-sm outline-none"
          />

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
                className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => updateDraft('city', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
                />
                <select
                  value={draft.state}
                  onChange={(e) => updateDraft('state', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
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
                  className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
                />
              </div>
            </>
          )}

          <div>
            <p className="text-xs font-bold text-brand-green/60">Tags (pick any that fit)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-pill px-3 py-1 text-xs font-bold transition-colors ${
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

          <div className="grid gap-3 sm:grid-cols-3">
            <LabeledNumber label="Duration (hrs)" value={draft.durationHours} onChange={(v) => updateDraft('durationHours', v)} />
            <LabeledNumber label="Capacity" value={draft.capacity} onChange={(v) => updateDraft('capacity', v)} />
            <LabeledNumber label="Min age" value={draft.minAge} onChange={(v) => updateDraft('minAge', v)} />
          </div>
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
          >
            {busy
              ? 'Publishing...'
              : draft.dates.filter(Boolean).length > 1
                ? `Publish ${draft.dates.filter(Boolean).length} sessions`
                : 'Publish listing'}
          </button>
        </form>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-brand-green">Your listings</h2>
        <div className="mt-4 flex flex-col gap-3">
          {myOpportunities.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              No listings yet — post your first opportunity and volunteers will find it on Browse.
            </p>
          )}
          {myOpportunities.map((opp) => (
            <div key={opp.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link to={`/opportunities/${opp.id}`} className="font-bold text-brand-green hover:underline">
                    {opp.title}
                  </Link>
                  <p className="text-sm text-brand-green/60">
                    {new Date(opp.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                    {opp.isOnline ? '🌐 Online · ' : ''}
                    {opp.spotsFilled}/{opp.capacity} signed up
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
                  className="rounded-pill bg-gold px-4 py-1.5 text-xs font-bold text-gold-text shadow-soft"
                >
                  {expandedId === opp.id ? 'Close' : '✓ Check in volunteers'}
                </button>
              </div>
              {expandedId === opp.id && <ListingVolunteers opportunity={opp} orgOwnerId={user.id} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// The trust loop: org sees who RSVP'd, taps verify, hours land in the
// volunteer's vault as org-verified. No forms, no email chains.
function ListingVolunteers({ opportunity, orgOwnerId }) {
  const [volunteers, setVolunteers] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchListingSignups(opportunity.id)
      .then(setVolunteers)
      .catch(() => setError("Couldn't load signups — run the latest database update and refresh."))
  }, [opportunity.id])

  async function handleVerify(volunteer) {
    setBusyId(volunteer.userId)
    setError('')
    try {
      await verifyAttendance({
        opportunityId: opportunity.id,
        volunteerId: volunteer.userId,
        hours: opportunity.durationHours,
        orgOwnerId,
      })
      setVolunteers((prev) =>
        prev.map((v) => (v.userId === volunteer.userId ? { ...v, status: 'attended' } : v)),
      )
    } catch {
      setError("Couldn't verify — check your connection and try again.")
    }
    setBusyId(null)
  }

  if (error && !volunteers) return <p className="mt-3 text-sm font-semibold text-coral">{error}</p>
  if (!volunteers) return <p className="mt-3 text-sm text-brand-green/50">Loading signups...</p>

  return (
    <div className="mt-3 border-t border-card-border pt-3">
      {volunteers.length === 0 && (
        <p className="text-sm text-brand-green/60">No signups yet for this one.</p>
      )}
      {error && <p className="mb-2 text-sm font-semibold text-coral">{error}</p>}
      <div className="flex flex-col gap-2">
        {volunteers.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-green">
              {v.displayName}
              {v.username && <span className="ml-1 text-xs text-brand-green/50">@{v.username}</span>}
            </p>
            {v.status === 'attended' ? (
              <span className="rounded-pill bg-category-environment-bg px-3 py-1 text-xs font-bold text-category-environment-text">
                ✓ Verified {opportunity.durationHours} hrs
              </span>
            ) : v.status === 'no_show' ? (
              <span className="rounded-pill bg-card-border px-3 py-1 text-xs font-bold text-brand-green/50">
                No-show
              </span>
            ) : (
              <button
                onClick={() => handleVerify(v)}
                disabled={busyId === v.userId}
                className="rounded-pill bg-brand-green px-4 py-1.5 text-xs font-bold text-cream-text shadow-soft disabled:opacity-50"
              >
                {busyId === v.userId ? 'Verifying...' : `✓ Attended — verify ${opportunity.durationHours} hrs`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBlock({ value, label }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-4 text-center shadow-card">
      <p className="font-display text-xl font-extrabold text-brand-green">{value}</p>
      <p className="text-xs font-semibold text-brand-green/60">{label}</p>
    </div>
  )
}

function LabeledNumber({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-brand-green/70">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-pill border border-card-border px-4 py-2 text-sm text-brand-green outline-none"
      />
    </label>
  )
}
