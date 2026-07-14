import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOpportunities } from '../lib/api'
import OpportunityCard from '../components/OpportunityCard'
import SuggestOpportunity from '../components/SuggestOpportunity'

// Community-organized = created through the quick-add/organize-a-project
// flow (org.submittedBy set), not a dashboard-run org or a curated directory
// listing. Same distinction the admin panel uses for the pending queue.
const isCommunityOrganized = (o) => !!o.org?.submittedBy

export default function Community() {
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)

  function loadOpportunities() {
    fetchOpportunities()
      .then((all) => setOpps(all.filter(isCommunityOrganized)))
      .catch(() => setOpps([]))
      .finally(() => setLoading(false))
  }

  useEffect(loadOpportunities, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">Community projects</h1>
      <p className="mt-1 text-brand-green/60">
        Real people organizing real projects — a beach cleanup, a food drive, whatever your cause
        needs. Post one, or join someone else's.
      </p>

      <div className="mt-6">
        <SuggestOpportunity onPosted={loadOpportunities} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-brand-green">Happening now</h2>
        <div className="mt-4 flex flex-col gap-4">
          {loading && (
            <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
              Loading...
            </p>
          )}
          {!loading && opps.length === 0 && (
            <div className="rounded-card border border-dashed border-card-border bg-card p-8 text-center shadow-card">
              <p className="text-4xl">🌱</p>
              <p className="mt-2 font-display font-bold text-brand-green">
                Nothing posted yet — be the first.
              </p>
              <p className="mt-1 text-sm text-brand-green/60">
                Know a cause that needs hands? Use "Organize a project" above to get it in front of
                people looking for something to do.
              </p>
            </div>
          )}
          {opps.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-brand-green/50">
        Looking for opportunities from real organizations instead?{' '}
        <Link to="/browse" className="font-bold text-coral hover:underline">
          Browse the full directory
        </Link>
      </p>
    </div>
  )
}
