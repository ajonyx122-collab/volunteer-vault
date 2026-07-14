import { useEffect, useState } from 'react'
import { fetchListingSignups, fetchCheckInCode, verifyAttendance, approveHours } from '../lib/api'

// The trust loop: the org (or community organizer) sees who RSVP'd, taps
// verify, hours land in the volunteer's vault as verified. No forms, no
// email chains — this is also how a community organizer finds out who
// signed up for their project.
export default function ListingVolunteers({ opportunity, orgOwnerId }) {
  const [volunteers, setVolunteers] = useState(null)
  const [checkInCode, setCheckInCode] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchListingSignups(opportunity.id)
      .then(setVolunteers)
      .catch(() => setError("Couldn't load signups — run the latest database update and refresh."))
    fetchCheckInCode(opportunity.id).then(setCheckInCode)
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
        prev.map((v) =>
          v.userId === volunteer.userId
            ? { ...v, status: 'attended', hourLog: { hours: opportunity.durationHours, status: 'verified' } }
            : v,
        ),
      )
    } catch {
      setError("Couldn't verify — check your connection and try again.")
    }
    setBusyId(null)
  }

  async function handleApprove(volunteer) {
    setBusyId(volunteer.userId)
    setError('')
    try {
      await approveHours(volunteer.hourLog.id)
      setVolunteers((prev) =>
        prev.map((v) =>
          v.userId === volunteer.userId ? { ...v, hourLog: { ...v.hourLog, status: 'verified' } } : v,
        ),
      )
    } catch {
      setError("Couldn't approve — check your connection and try again.")
    }
    setBusyId(null)
  }

  if (error && !volunteers) return <p className="mt-3 text-sm font-semibold text-coral">{error}</p>
  if (!volunteers) return <p className="mt-3 text-sm text-brand-green/50">Loading signups...</p>

  return (
    <div className="mt-3 border-t border-card-border pt-3">
      {checkInCode && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-card bg-cream p-3">
          <span className="rounded-card bg-brand-green px-4 py-2 font-display text-xl font-extrabold tracking-[0.3em] text-cream-text">
            {checkInCode}
          </span>
          <p className="min-w-0 flex-1 text-xs text-brand-green/70">
            <span className="font-bold">Your event code.</span> Announce it or write it up at the
            event — volunteers type it in the app and their hours verify instantly, no taps needed
            from you.
          </p>
        </div>
      )}
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
            {v.hourLog?.status === 'verified' || v.status === 'attended' ? (
              <span className="rounded-pill bg-category-environment-bg px-3 py-1 text-xs font-bold text-category-environment-text">
                ✓ Verified {v.hourLog?.hours ?? opportunity.durationHours} hrs
              </span>
            ) : v.hourLog?.status === 'pending' ? (
              <button
                onClick={() => handleApprove(v)}
                disabled={busyId === v.userId}
                className="rounded-pill bg-gold px-4 py-1.5 text-xs font-bold text-gold-text shadow-soft disabled:opacity-50"
              >
                {busyId === v.userId ? 'Approving...' : `Approve requested ${v.hourLog.hours} hrs`}
              </button>
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
