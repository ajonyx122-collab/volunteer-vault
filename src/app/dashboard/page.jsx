'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { opportunityPath } from '../../lib/opportunityUrls'
import { useAuth } from '../../lib/AuthContext'
import {
  fetchMyOrganization,
  createOrganization,
  updateOrganization,
  fetchOrgOpportunities,
  fetchOrgVolunteers,
} from '../../lib/api'
import VerifiedBadge from '../../components/VerifiedBadge'
import OrgAvatar from '../../components/OrgAvatar'
import ListingVolunteers from '../../components/ListingVolunteers'
import FounderProfileForm from '../../components/FounderProfileForm'
import OrgMediaManager from '../../components/OrgMediaManager'

const TABS = [
  { id: 'postings', label: 'Postings' },
  { id: 'volunteers', label: 'Volunteers' },
  { id: 'organization', label: 'Organization' },
]

export default function OrgDashboard() {
  const { user, loading } = useAuth()
  const [org, setOrg] = useState(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [myOpportunities, setMyOpportunities] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [tab, setTab] = useState('postings')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgLocation, setNewOrgLocation] = useState('')
  const [isFounder, setIsFounder] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const [draftName, setDraftName] = useState('')
  const [draftWebsite, setDraftWebsite] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftContactEmail, setDraftContactEmail] = useState('')
  const [draftContactPhone, setDraftContactPhone] = useState('')
  const [saved, setSaved] = useState(false)

  // "List your nonprofit" on /student-led links here with ?founder=1.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('founder')) {
      setIsFounder(true)
      setTab('organization')
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setOrgLoading(false)
      return
    }
    fetchMyOrganization(user.id)
      .then(async (myOrg) => {
        setOrg(myOrg)
        if (myOrg) {
          loadDraft(myOrg)
          const [opps, vols] = await Promise.all([
            fetchOrgOpportunities(myOrg.id),
            fetchOrgVolunteers(myOrg.id).catch(() => []),
          ])
          setMyOpportunities(opps)
          setVolunteers(vols)
        }
      })
      .finally(() => setOrgLoading(false))
  }, [user])

  function loadDraft(o) {
    setDraftName(o.name ?? '')
    setDraftWebsite(o.website ?? '')
    setDraftDescription(o.description ?? '')
    setDraftContactEmail(o.contactEmail ?? '')
    setDraftContactPhone(o.contactPhone ?? '')
  }

  async function handleCreateOrg(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await createOrganization(user.id, { name: newOrgName, location: newOrgLocation, isStudentLed: isFounder })
      setOrg(created)
      loadDraft(created)
    } catch (err) {
      setError(err.message ?? 'Could not create the organization.')
    }
    setBusy(false)
  }

  async function handleSaveOrg(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const updated = await updateOrganization(org.id, {
        name: draftName,
        description: draftDescription,
        website: draftWebsite,
        contactEmail: draftContactEmail,
        contactPhone: draftContactPhone,
      })
      setOrg(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
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
      <div className="mx-4 my-16 flex max-w-md flex-col items-center gap-4 rounded-card border-2 border-brand-green bg-card px-6 py-12 text-center shadow-pop-soft sm:mx-auto">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Org dashboard</h1>
        <p className="text-brand-green/70">Log in with your organization account to manage listings.</p>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none">
            Log in
          </Link>
          <Link href="/signup" className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none">
            Join free
          </Link>
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="mx-4 my-12 max-w-md rounded-card border-2 border-brand-green bg-card px-5 py-8 shadow-pop-soft sm:mx-auto sm:px-8">
        <div className="text-center">
          <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-brand-green">
            {isFounder ? 'List your student nonprofit' : 'Set up your organization'}
          </h1>
          <p className="mt-1 text-brand-green/70">
            {isFounder
              ? "Start with the basics — next you'll add your mission, goal, and donate link."
              : 'One quick step and you can start posting opportunities.'}
          </p>
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
          <label className="flex items-start gap-2 rounded-card border border-card-border bg-card p-3 text-sm text-brand-green">
            <input
              type="checkbox"
              checked={isFounder}
              onChange={(e) => setIsFounder(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1B5E38]"
            />
            <span>
              <span className="font-bold">🎓 I started this as a student</span>
              <span className="block text-xs text-brand-green/60">
                High school, college, or a recent grad who started it in school — you'll get a page
                in the Student-Led section.
              </span>
            </span>
          </label>
          {error && <p className="text-sm font-semibold text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none disabled:opacity-60"
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
      <div className="relative overflow-hidden rounded-card border-2 border-brand-green bg-brand-green bg-gradient-to-br from-[#1B6E42] via-brand-green to-[#14432b] p-5 shadow-pop-soft sm:p-6">
        <span className="pointer-events-none absolute -right-4 -top-6 rotate-12 text-8xl opacity-15" aria-hidden>
          🏢
        </span>
        <p className="text-xs font-extrabold uppercase tracking-widest text-gold">Your organization</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-full border-4 border-cream/80">
              <OrgAvatar org={org} size="md" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold leading-tight text-cream-text sm:text-3xl">{org.name}</h1>
                <VerifiedBadge verified={org.verified} />
              </div>
              {org.website && (
                <a
                  href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block text-sm font-semibold text-cream-muted hover:text-cream-text"
                >
                  🌐 {org.website}
                </a>
              )}
            </div>
          </div>
          <Link
            href="/post-opportunity"
            className="w-full rounded-pill bg-gold px-5 py-2.5 text-center text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none sm:w-auto"
          >
            + New opportunity
          </Link>
        </div>
      </div>

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

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <StatBlock value={myOpportunities.length} label="Active listings" icon="📋" tone="bg-category-music-bg" />
        <StatBlock value={totalSignups} label="Total signups" icon="✋" tone="bg-category-food-bg" />
        <StatBlock value={volunteers.length} label="Volunteers" icon="🙋" tone="bg-category-environment-bg" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-1.5 rounded-card border-2 border-brand-green bg-card p-1.5 shadow-pop-soft">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-[12px] px-2 py-2.5 text-sm font-extrabold transition-all ${
              tab === t.id ? 'bg-brand-green text-cream-text shadow-pop' : 'text-brand-green hover:bg-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'postings' && (
        <section className="mt-6">
          <div className="flex flex-col gap-3">
            {myOpportunities.length === 0 && (
              <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
                No listings yet — post your first opportunity and volunteers will find it on Browse.
              </p>
            )}
            {myOpportunities.map((opp) => (
              <div key={opp.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={opportunityPath(opp)} className="font-bold text-brand-green hover:underline">
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
      )}

      {tab === 'volunteers' && (
        <section className="mt-6">
          <p className="mb-3 text-sm text-brand-green/60">
            Everyone who's RSVP'd or logged hours across any of your listings — self-reported, honor
            system, no approval needed from you.
          </p>
          <div className="flex flex-col gap-2">
            {volunteers.length === 0 && (
              <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
                No volunteers yet — once someone RSVPs or logs hours on a listing, they'll show up here.
              </p>
            )}
            {volunteers.map((v) => (
              <div
                key={v.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-card-border bg-card p-4 shadow-card"
              >
                <div className="min-w-0">
                  <p className="font-bold text-brand-green">
                    {v.displayName}
                    {v.username && <span className="ml-1 font-normal text-brand-green/50">@{v.username}</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {v.listings.map((title) => (
                      <span
                        key={title}
                        className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-bold text-brand-green/70"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="shrink-0 font-display font-extrabold text-brand-green">{v.hours} hrs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'organization' && (
        <>
        <form
          onSubmit={handleSaveOrg}
          className="mt-6 flex flex-col gap-3 rounded-card border border-card-border bg-card p-5 shadow-card"
        >
          <label className="text-xs font-bold text-brand-green/60">
            Organization name
            <input
              required
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
            />
          </label>
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
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="self-start rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
            >
              {busy ? 'Saving...' : 'Save changes'}
            </button>
            {saved && <p className="text-xs font-semibold text-brand-green/60">✓ Saved</p>}
          </div>
        </form>
        <OrgMediaManager org={org} onSaved={setOrg} />
        <FounderProfileForm key={org.id} org={org} onSaved={setOrg} />
        </>
      )}
    </div>
  )
}

function StatBlock({ value, label, icon, tone = 'bg-card' }) {
  return (
    <div className={`rounded-card border-2 border-brand-green p-4 text-center shadow-pop-soft ${tone}`}>
      <p className="text-xl" aria-hidden>
        {icon}
      </p>
      <p className="font-display text-2xl font-extrabold text-brand-green">{value}</p>
      <p className="text-xs font-semibold text-brand-green/60">{label}</p>
    </div>
  )
}
