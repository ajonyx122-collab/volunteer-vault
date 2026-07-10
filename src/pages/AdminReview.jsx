import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import {
  fetchPendingOrganizations,
  verifyOrganization,
  deleteOrganization,
  fetchPendingSuggestions,
  updateSuggestionStatus,
} from '../lib/api'
import OrgAvatar from '../components/OrgAvatar'

export default function AdminReview() {
  const { user, profile, loading } = useAuth()
  const [orgs, setOrgs] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const isAdmin = profile?.is_admin

  useEffect(() => {
    if (!isAdmin) return
    fetchPendingOrganizations().then(setOrgs)
    fetchPendingSuggestions().then(setSuggestions)
  }, [isAdmin])

  async function handleVerify(orgId) {
    setBusyId(orgId)
    await verifyOrganization(orgId)
    setOrgs((prev) => prev.filter((o) => o.id !== orgId))
    setBusyId(null)
  }

  async function handleRemoveOrg(orgId) {
    setBusyId(orgId)
    await deleteOrganization(orgId)
    setOrgs((prev) => prev.filter((o) => o.id !== orgId))
    setBusyId(null)
  }

  async function handleSuggestion(id, status) {
    setBusyId(id)
    await updateSuggestionStatus(id, status)
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
    setBusyId(null)
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">Admin review</h1>
      <p className="mt-1 text-brand-green/60">Verify volunteer-added listings and review suggestions.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-extrabold text-brand-green">
          Pending organizations {orgs && `(${orgs.length})`}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {orgs === null && <p className="text-sm text-brand-green/50">Loading...</p>}
          {orgs?.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
              Nothing waiting on review.
            </p>
          )}
          {orgs?.map((org) => (
            <div key={org.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <OrgAvatar org={org} size="md" />
                  <div>
                    <p className="font-bold text-brand-green">{org.name}</p>
                    <p className="text-xs text-brand-green/50">
                      {[org.location, org.website].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-1 text-sm text-brand-green/70">{org.description}</p>
                    {org.opportunities?.map((o) => (
                      <p key={o.id} className="mt-1 text-xs font-semibold text-brand-green/60">
                        📌 {o.title}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleVerify(org.id)}
                    disabled={busyId === org.id}
                    className="rounded-pill bg-brand-green px-4 py-1.5 text-xs font-bold text-cream-text shadow-soft disabled:opacity-50"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleRemoveOrg(org.id)}
                    disabled={busyId === org.id}
                    className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-coral disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-brand-green">
          Suggestions inbox {suggestions && `(${suggestions.length})`}
        </h2>
        <p className="mt-1 text-xs text-brand-green/50">
          From logged-out visitors. Add these yourself via "Add an opportunity" on Browse, then mark handled here.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {suggestions === null && <p className="text-sm text-brand-green/50">Loading...</p>}
          {suggestions?.length === 0 && (
            <p className="rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
              No new suggestions.
            </p>
          )}
          {suggestions?.map((s) => (
            <div key={s.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-green">{s.orgName}</p>
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-coral hover:underline"
                  >
                    {s.website}
                  </a>
                  <p className="mt-1 text-sm text-brand-green/70">{s.notes}</p>
                  <p className="mt-1 text-xs text-brand-green/50">
                    {[s.city, s.state].filter(Boolean).join(', ')}
                    {s.submitterEmail && ` · from ${s.submitterEmail}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleSuggestion(s.id, 'approved')}
                    disabled={busyId === s.id}
                    className="rounded-pill bg-brand-green px-4 py-1.5 text-xs font-bold text-cream-text shadow-soft disabled:opacity-50"
                  >
                    Mark handled
                  </button>
                  <button
                    onClick={() => handleSuggestion(s.id, 'rejected')}
                    disabled={busyId === s.id}
                    className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-coral disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
