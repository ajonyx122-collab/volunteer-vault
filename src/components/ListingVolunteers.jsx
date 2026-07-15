import { useEffect, useState } from 'react'
import { fetchListingSignups } from '../lib/api'

// Read-only roster: who RSVP'd and how many hours they've self-logged so
// far. Hours are honor-system self-reported now, so there's nothing for an
// org/organizer to verify or approve here — this is just visibility into
// who's coming, the same way it always told a community organizer who
// signed up, in place of email.
export default function ListingVolunteers({ opportunity }) {
  const [volunteers, setVolunteers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchListingSignups(opportunity.id)
      .then(setVolunteers)
      .catch(() => setError("Couldn't load signups — run the latest database update and refresh."))
  }, [opportunity.id])

  if (error && !volunteers) return <p className="mt-3 text-sm font-semibold text-coral">{error}</p>
  if (!volunteers) return <p className="mt-3 text-sm text-brand-green/50">Loading signups...</p>

  return (
    <div className="mt-3 border-t border-card-border pt-3">
      {volunteers.length === 0 && (
        <p className="text-sm text-brand-green/60">No signups yet for this one.</p>
      )}
      <div className="flex flex-col gap-2">
        {volunteers.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-green">
              {v.displayName}
              {v.username && <span className="ml-1 text-xs text-brand-green/50">@{v.username}</span>}
            </p>
            {v.entryCount > 0 ? (
              <span className="rounded-pill bg-category-environment-bg px-3 py-1 text-xs font-bold text-category-environment-text">
                ✓ {v.hourLogTotal} hrs logged
              </span>
            ) : v.status === 'no_show' ? (
              <span className="rounded-pill bg-card-border px-3 py-1 text-xs font-bold text-brand-green/50">
                No-show
              </span>
            ) : (
              <span className="rounded-pill bg-card-border px-3 py-1 text-xs font-bold text-brand-green/50">
                No hours logged yet
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
