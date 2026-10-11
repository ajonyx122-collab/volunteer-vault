'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  fetchAmbassadorApplications,
  updateAmbassadorApplication,
  deleteAmbassadorApplication,
} from '../lib/api'

const STATUSES = [
  { id: 'new', label: 'New', pill: 'bg-gold text-gold-text' },
  { id: 'contacted', label: 'Contacted', pill: 'bg-[#E4EEFB] text-[#1D5B9E]' },
  { id: 'accepted', label: 'Accepted', pill: 'bg-[#DFF0E6] text-[#0F5132]' },
  { id: 'declined', label: 'Declined', pill: 'bg-cream text-brand-green/50' },
]

// Admin-only inbox for /ambassadors interest forms. Lives on /admin.
export default function AdminAmbassadors() {
  const [apps, setApps] = useState(null)
  const [filter, setFilter] = useState('new')
  const [busyId, setBusyId] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAmbassadorApplications().then(setApps).catch(() => setApps([]))
  }, [])

  // Note saves fire on blur, i.e. right as you click a status button — so they
  // must not disable the buttons, or that click gets swallowed.
  async function save(id, fields) {
    const isStatus = fields.status !== undefined
    if (isStatus) setBusyId(id)
    try {
      await updateAmbassadorApplication(id, fields)
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)))
    } catch {
      alert("Couldn't save that change — try again.")
    }
    if (isStatus) setBusyId(null)
  }

  async function remove(a) {
    if (!confirm(`Delete ${a.fullName}'s application for good? (Use "Declined" if you just want it out of the way.)`)) return
    setBusyId(a.id)
    try {
      await deleteAmbassadorApplication(a.id)
      setApps((prev) => prev.filter((x) => x.id !== a.id))
    } catch {
      alert("Couldn't delete that — try again.")
    }
    setBusyId(null)
  }

  const shown =apps?.filter((a) => filter === 'all' || a.status === filter) ?? []
  const countFor = (id) => apps?.filter((a) => a.status === id).length ?? 0

  async function copyEmails() {
    await navigator.clipboard.writeText(shown.map((a) => a.email).join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-extrabold text-brand-green">
        Ambassador applications {apps && `(${countFor('new')} new)`}
      </h2>
      <p className="mt-1 text-xs text-brand-green/50">
        From the /ambassadors form. Email them, then move them along: New → Contacted → Accepted/Declined.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[...STATUSES, { id: 'all', label: 'All' }].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`rounded-pill px-3 py-1 text-xs font-bold ${
              filter === s.id ? 'bg-brand-green text-cream-text' : 'border border-card-border bg-card text-brand-green/70'
            }`}
          >
            {s.label} ({s.id === 'all' ? apps?.length ?? 0 : countFor(s.id)})
          </button>
        ))}
        {shown.length > 0 && (
          <button onClick={copyEmails} className="ml-auto text-xs font-bold text-coral hover:underline">
            {copied ? 'Copied!' : `Copy ${shown.length} email${shown.length === 1 ? '' : 's'}`}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {apps === null && <p className="text-sm text-brand-green/50">Loading...</p>}
        {apps && shown.length === 0 && (
          <p className="rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
            Nothing here.
          </p>
        )}
        {shown.map((a) => {
          const status = STATUSES.find((s) => s.id === a.status)
          return (
            <div key={a.id} className="rounded-card border border-card-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-brand-green">{a.fullName}</p>
                    <span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${status?.pill}`}>{status?.label}</span>
                    {a.username && (
                      <Link href={`/u/${a.username}`} className="text-xs font-semibold text-coral hover:underline">
                        @{a.username}
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-brand-green/80">
                    🏫 {a.school}
                    {(a.schoolCity || a.schoolState) && ` — ${[a.schoolCity, a.schoolState].filter(Boolean).join(', ')}`}
                    {a.gradYear && ` · Class of ${a.gradYear}`}
                  </p>
                </div>
                <p className="text-xs text-brand-green/40">
                  Applied {new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                <a
                  href={`mailto:${a.email}?subject=${encodeURIComponent('VolunteerVault School Ambassador')}`}
                  className="text-coral hover:underline"
                >
                  ✉️ {a.email}
                </a>
                {a.phone && <a href={`tel:${a.phone}`} className="text-coral hover:underline">📞 {a.phone}</a>}
                {a.socialHandle && <span className="text-brand-green/70">📱 {a.socialHandle}</span>}
              </div>

              <dl className="mt-3 grid gap-2 rounded-card bg-cream p-3 text-xs sm:grid-cols-2">
                <Detail label="Why / ideas" value={a.why} wide />
                <Detail label="Clubs & groups" value={a.clubs} />
                <Detail label="Time available" value={a.hoursPerMonth} />
                <Detail label="Heard about us from" value={a.heardFrom} />
              </dl>

              <textarea
                defaultValue={a.adminNote ?? ''}
                placeholder="Private note (e.g. 'emailed 10/12, call Thursday')... saves when you click away"
                rows={2}
                onBlur={(e) => {
                  if (e.target.value !== (a.adminNote ?? '')) save(a.id, { adminNote: e.target.value })
                }}
                className="mt-3 w-full rounded-card border border-card-border px-3 py-2 text-xs outline-none"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s.id !== a.status).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => save(a.id, { status: s.id })}
                    disabled={busyId === a.id}
                    className="rounded-pill border border-card-border px-3 py-1 text-xs font-bold text-brand-green/80 hover:bg-cream disabled:opacity-50"
                  >
                    Mark {s.label.toLowerCase()}
                  </button>
                ))}
                <button
                  onClick={() => remove(a)}
                  disabled={busyId === a.id}
                  className="ml-auto text-xs font-bold text-coral hover:underline disabled:opacity-50"
                >
                  Delete (spam/test)
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Detail({ label, value, wide }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="font-bold text-brand-green/50">{label}</dt>
      <dd className="whitespace-pre-wrap text-brand-green/80">{value || '—'}</dd>
    </div>
  )
}
