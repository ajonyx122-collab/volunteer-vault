import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchOrgAdminDetail, adminSetOrgNote, verifyOrganization, deleteOrganization } from '../lib/api'
import { getCategoryMeta } from '../data/mockData'
import OrgAvatar from '../components/OrgAvatar'
import VerifiedBadge from '../components/VerifiedBadge'

export default function AdminOrgDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [data, setData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const isAdmin = profile?.is_admin

  useEffect(() => {
    if (!isAdmin) return
    fetchOrgAdminDetail(id).then((result) => {
      if (!result) {
        setNotFound(true)
        return
      }
      setData(result)
      setNoteDraft(result.org.adminNote ?? '')
    })
  }, [isAdmin, id])

  async function handleSaveNote() {
    setBusy(true)
    setSaved(false)
    try {
      await adminSetOrgNote(id, noteDraft)
      setData((prev) => ({ ...prev, org: { ...prev.org, adminNote: noteDraft.trim() || null } }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // leave the draft as-is; the save button just isn't disabled anymore
    }
    setBusy(false)
  }

  async function handleVerify() {
    setBusy(true)
    await verifyOrganization(id)
    setData((prev) => ({ ...prev, org: { ...prev.org, verified: true } }))
    setBusy(false)
  }

  async function handleRemove() {
    setBusy(true)
    await deleteOrganization(id)
    navigate('/admin')
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading...</div>
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Not authorized</h1>
        <p className="text-brand-green/70">This page is only for VolunteerVault admins.</p>
        <Link to="/browse" className="font-bold text-coral hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-brand-green/70">That organization doesn't exist (or was removed).</p>
        <Link to="/admin" className="mt-3 inline-block font-bold text-coral hover:underline">
          ← Back to admin
        </Link>
      </div>
    )
  }

  if (!data) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading org...</div>
  }

  const { org, listings } = data
  const totalSignups = listings.reduce((sum, l) => sum + l.signupCount, 0)
  const totalHours = listings.reduce((sum, l) => sum + l.hoursLogged, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/admin" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to admin
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <OrgAvatar org={org} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold text-brand-green">{org.name}</h1>
              <VerifiedBadge verified={org.verified} />
            </div>
            <p className="text-sm text-brand-green/60">{org.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!org.verified && (
            <button
              onClick={handleVerify}
              disabled={busy}
              className="rounded-pill bg-brand-green px-4 py-1.5 text-xs font-bold text-cream-text shadow-soft disabled:opacity-50"
            >
              ✓ Verify org
            </button>
          )}
          <button
            onClick={handleRemove}
            disabled={busy}
            className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-coral disabled:opacity-50"
          >
            Remove org
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-card-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-brand-green">Org info</h2>
        {org.description && <p className="mt-2 text-sm text-brand-green/70">{org.description}</p>}
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {org.website && (
            <div>
              <dt className="text-xs font-bold text-brand-green/50">Website</dt>
              <dd className="text-brand-green">{org.website}</dd>
            </div>
          )}
          {org.contactEmail && (
            <div>
              <dt className="text-xs font-bold text-brand-green/50">Contact email</dt>
              <dd className="text-brand-green">{org.contactEmail}</dd>
            </div>
          )}
          {org.contactPhone && (
            <div>
              <dt className="text-xs font-bold text-brand-green/50">Contact phone</dt>
              <dd className="text-brand-green">{org.contactPhone}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-bold text-brand-green/50">Account type</dt>
            <dd className="text-brand-green">
              {org.ownerId ? 'Org dashboard account' : 'Community-organized'}
            </dd>
          </div>
        </dl>
        {!org.website && !org.contactEmail && !org.contactPhone && (
          <p className="mt-2 text-xs text-brand-green/40">No contact info on file.</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatTile value={listings.length} label="Listings" />
        <StatTile value={totalSignups} label="RSVPs" />
        <StatTile value={Math.round(totalHours)} label="Hours logged" />
      </div>

      <div className="mt-6 rounded-card border border-card-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-bold text-brand-green">Note to this org</h2>
        <p className="mt-1 text-xs text-brand-green/50">
          Shows on their dashboard — use it to flag something they should fix or change. Leave blank
          and save to clear it.
        </p>
        <textarea
          rows={3}
          placeholder="e.g. Please add a real description before we can verify this listing."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          className="mt-3 w-full rounded-card border border-card-border px-4 py-2.5 text-sm outline-none"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={handleSaveNote}
            disabled={busy}
            className="rounded-pill bg-brand-green px-5 py-2 text-xs font-bold text-cream-text shadow-soft disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Save note'}
          </button>
          {saved && <p className="text-xs font-semibold text-brand-green/60">✓ Saved</p>}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-extrabold text-brand-green">
          Listings ({listings.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {listings.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
              This org hasn't posted anything yet.
            </p>
          )}
          {listings.map((l) => {
            const meta = getCategoryMeta(l.category)
            return (
              <div key={l.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/opportunities/${l.id}`}
                      className="font-bold text-brand-green hover:underline"
                    >
                      {meta?.icon} {l.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-brand-green/60">
                      {l.isOngoing
                        ? 'Ongoing'
                        : new Date(l.startsAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                      {' · '}
                      {l.durationHours} hrs · capacity {l.capacity} · min age {l.minAge}
                      {l.isOnline ? ' · 🌐 online' : ''}
                      {l.isExternal ? ' · external signup' : ''}
                    </p>
                    {l.description && (
                      <p className="mt-1 max-w-lg text-xs text-brand-green/70">{l.description}</p>
                    )}
                    {l.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-bold text-brand-green/70"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-xs font-semibold text-brand-green/60">
                    <p>{l.signupCount} signed up</p>
                    <p>{Math.round(l.hoursLogged)} hrs logged</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-3 text-center shadow-card">
      <p className="font-display text-xl font-extrabold text-brand-green">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-green/50">{label}</p>
    </div>
  )
}
