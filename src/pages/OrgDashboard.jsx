import { useState } from 'react'
import { CATEGORIES, opportunities as seedOpportunities, organizations } from '../data/mockData'
import VerifiedBadge from '../components/VerifiedBadge'

// Demo: acting as the logged-in org. Real auth/org-switching comes with Supabase wiring.
const DEMO_ORG_ID = 'org-1'

const emptyDraft = {
  title: '',
  category: CATEGORIES[0].id,
  description: '',
  startsAt: '',
  durationHours: 2,
  address: '',
  capacity: 20,
  minAge: 12,
}

export default function OrgDashboard() {
  const org = organizations.find((o) => o.id === DEMO_ORG_ID)
  const [myOpportunities, setMyOpportunities] = useState(
    seedOpportunities.filter((o) => o.orgId === DEMO_ORG_ID),
  )
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newOpp = {
      id: `opp-${Date.now()}`,
      orgId: DEMO_ORG_ID,
      ...draft,
      durationHours: Number(draft.durationHours),
      capacity: Number(draft.capacity),
      minAge: Number(draft.minAge),
      spotsFilled: 0,
      vibeRating: null,
      reviewQuote: '',
      goingFriends: [],
      distanceMiles: 0,
      tags: [],
    }
    setMyOpportunities((prev) => [newOpp, ...prev])
    setDraft(emptyDraft)
    setShowForm(false)
  }

  const totalSignups = myOpportunities.reduce((sum, o) => sum + o.spotsFilled, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-extrabold text-brand-green">{org?.name}</h1>
          <VerifiedBadge verified={org?.verified} />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          {showForm ? 'Cancel' : '+ New opportunity'}
        </button>
      </div>

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
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={draft.category}
              onChange={(e) => updateDraft('category', e.target.value)}
              className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
            <input
              required
              type="datetime-local"
              value={draft.startsAt}
              onChange={(e) => updateDraft('startsAt', e.target.value)}
              className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
            />
          </div>
          <textarea
            required
            placeholder="Description"
            value={draft.description}
            onChange={(e) => updateDraft('description', e.target.value)}
            rows={3}
            className="rounded-card border border-card-border px-4 py-2 text-sm outline-none"
          />
          <input
            required
            placeholder="Address"
            value={draft.address}
            onChange={(e) => updateDraft('address', e.target.value)}
            className="rounded-pill border border-card-border px-4 py-2 text-sm outline-none"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <LabeledNumber label="Duration (hrs)" value={draft.durationHours} onChange={(v) => updateDraft('durationHours', v)} />
            <LabeledNumber label="Capacity" value={draft.capacity} onChange={(v) => updateDraft('capacity', v)} />
            <LabeledNumber label="Min age" value={draft.minAge} onChange={(v) => updateDraft('minAge', v)} />
          </div>
          <button
            type="submit"
            className="mt-2 self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            Publish listing
          </button>
        </form>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-brand-green">Your listings</h2>
        <div className="mt-4 flex flex-col gap-3">
          {myOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-card-border bg-card p-4 shadow-card"
            >
              <div>
                <p className="font-bold text-brand-green">{opp.title}</p>
                <p className="text-sm text-brand-green/60">
                  {new Date(opp.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                  {opp.spotsFilled}/{opp.capacity} signed up
                </p>
              </div>
              <span className="rounded-pill bg-cream px-3 py-1 text-xs font-bold text-brand-green/70">
                {opp.capacity - opp.spotsFilled} spots left
              </span>
            </div>
          ))}
        </div>
      </section>
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
