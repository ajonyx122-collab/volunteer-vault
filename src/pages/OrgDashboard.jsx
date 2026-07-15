import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchMyOrganization, createOrganization, updateOrganization, fetchOrgOpportunities } from '../lib/api'
import VerifiedBadge from '../components/VerifiedBadge'
import OrgAvatar from '../components/OrgAvatar'
import ListingVolunteers from '../components/ListingVolunteers'

export default function OrgDashboard() {
  const { user, loading } = useAuth()
  const [org, setOrg] = useState(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [myOpportunities, setMyOpportunities] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgLocation, setNewOrgLocation] = useState('')
  const [editingOrg, setEditingOrg] = useState(false)
  const [draftWebsite, setDraftWebsite] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftContactEmail, setDraftContactEmail] = useState('')
  const [draftContactPhone, setDraftContactPhone] = useState('')
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
    setDraftContactEmail(org.contactEmail ?? '')
    setDraftContactPhone(org.contactPhone ?? '')
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
        contactEmail: draftContactEmail,
        contactPhone: draftContactPhone,
      })
      setOrg(updated)
      setEditingOrg(false)
    } catch (err) {
      setError(err.message ?? 'Could not save.')
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
          <Link
            to="/post-opportunity"
            className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            + New opportunity
          </Link>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-brand-green/60">
              Contact email — optional
              <input
                type="email"
                placeholder="hello@yourorg.org"
                value={draftContactEmail}
                onChange={(e) => setDraftContactEmail(e.target.value)}
                className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
              />
            </label>
            <label className="text-xs font-bold text-brand-green/60">
              Contact phone — optional
              <input
                type="tel"
                placeholder="(555) 555-5555"
                value={draftContactPhone}
                onChange={(e) => setDraftContactPhone(e.target.value)}
                className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
              />
            </label>
          </div>
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

      {org.adminNote && (
        <div className="mt-4 rounded-card border border-gold bg-category-food-bg p-4 text-sm text-gold-text shadow-card">
          <p className="font-bold">📝 Note from a VolunteerVault admin</p>
          <p className="mt-1">{org.adminNote}</p>
        </div>
      )}

      {!org.verified && (
        <p className="mt-4 rounded-card border border-card-border bg-card p-4 text-sm text-brand-green/70 shadow-card">
          Your org shows as <span className="font-bold">Pending</span> until an admin verifies it —
          your listings are still live and searchable in the meantime.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatBlock value={myOpportunities.length} label="Active listings" />
        <StatBlock value={totalSignups} label="Total signups" />
        <StatBlock value="✓" label="Honor-system hours" />
      </div>


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
                    {opp.isOngoing
                      ? 'Ongoing'
                      : new Date(opp.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {' · '}
                    {opp.isOnline ? '🌐 Online · ' : ''}
                    {opp.spotsFilled}/{opp.capacity} signed up
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
                  className="rounded-pill bg-gold px-4 py-1.5 text-xs font-bold text-gold-text shadow-soft"
                >
                  {expandedId === opp.id ? 'Close' : '✓ See who signed up'}
                </button>
              </div>
              {expandedId === opp.id && <ListingVolunteers opportunity={opp} />}
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
