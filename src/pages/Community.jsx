import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchOpportunities, fetchMyCommunityPosts } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import OpportunityCard from '../components/OpportunityCard'
import SuggestOpportunity from '../components/SuggestOpportunity'
import ListingVolunteers from '../components/ListingVolunteers'

// Community-organized = created through the quick-add/organize-a-project
// flow (org.submittedBy set), not a dashboard-run org or a curated directory
// listing. Same distinction the admin panel uses for the pending queue.
const isCommunityOrganized = (o) => !!o.org?.submittedBy

export default function Community() {
  const { user } = useAuth()
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [myPosts, setMyPosts] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [showExample, setShowExample] = useState(false)

  function loadOpportunities() {
    fetchOpportunities()
      .then((all) => setOpps(all.filter(isCommunityOrganized)))
      .catch(() => setOpps([]))
      .finally(() => setLoading(false))
    if (user) {
      fetchMyCommunityPosts(user.id)
        .then(setMyPosts)
        .catch(() => setMyPosts([]))
    }
  }

  useEffect(loadOpportunities, [user])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">Community projects</h1>
      <p className="mt-1 text-brand-green/60">
        Real people organizing real projects — a beach cleanup, a food drive, whatever your cause
        needs. Post one, or join someone else's.
      </p>

      <button
        onClick={() => setShowExample((v) => !v)}
        className="mt-4 rounded-pill border border-card-border bg-card px-4 py-2 text-xs font-bold text-brand-green shadow-card hover:bg-cream"
      >
        {showExample ? 'Hide example ▲' : "New here? See what a good post looks like ▼"}
      </button>

      {showExample && (
        <div className="mt-3 rounded-card border-2 border-dashed border-gold bg-card p-5 shadow-card sm:p-6">
          <span className="rounded-pill bg-gold px-3 py-1 text-xs font-bold text-gold-text">
            📋 EXAMPLE — not a real listing
          </span>
          <p className="mt-3 font-display text-lg font-bold text-brand-green">
            Riverside Creek Fall Cleanup Day
          </p>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div>
              <dt className="font-bold text-brand-green/60">Category</dt>
              <dd className="text-brand-green">🌱 Environment</dd>
            </div>
            <div>
              <dt className="font-bold text-brand-green/60">
                Description — this is the part people actually decide on. Cover what, where, who's
                running it, and what to expect. Aim for 6-12 sentences, not one line.
              </dt>
              <dd className="mt-1 leading-relaxed text-brand-green">
                "Join us for a fall cleanup along the Riverside Creek trail, where we'll spend the
                morning clearing litter, invasive plants, and storm debris from the walking path and
                the creek bank itself. This stretch of trail sees hundreds of walkers, runners, and
                dog owners every week, but the last big cleanup was over a year ago, so there's a
                real backlog of trash caught in the brush. We'll meet at the main parking lot off
                Riverside Drive, right next to the wooden trail map sign, and break into small groups
                so we can cover both the north and south sections at the same time. I'm a junior at
                Lincoln High and I've organized river cleanups with my environmental club for two
                years, so I'll have safety basics covered and extra supplies on hand. Expect to be on
                your feet for about two hours, with some bending, reaching, and occasionally wading
                into shallow water, so wear shoes you don't mind getting muddy. We'll provide trash
                bags, grabber tools, and disposable gloves, but your own reusable gloves are welcome
                too. This counts toward NHS and general service hours — everyone can log their own
                hours afterward right in the app, honor system, no codes needed. We'll wrap up
                around 11am with a quick trash weigh-in, and there's
                usually a taco truck near the lot afterward if anyone wants lunch. Rain or shine, but
                if there's lightning in the forecast I'll post an update that morning, so check back
                here if the weather looks rough."
              </dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-green/60">When</dt>
                <dd className="text-brand-green">Saturday, Sept 12 · 9:00 AM</dd>
              </div>
              <div>
                <dt className="font-bold text-brand-green/60">How many can join</dt>
                <dd className="text-brand-green">25</dd>
              </div>
            </div>
            <div>
              <dt className="font-bold text-brand-green/60">What to bring</dt>
              <dd className="text-brand-green">
                Closed-toe shoes you don't mind getting muddy, a reusable water bottle, sunscreen,
                and reusable gloves if you have them.
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-green/50">
            Recurring project, like a cleanup every month? Use "+ Add another date" in the form below
            to post every date at once. Running for weeks or months with no fixed schedule? Mark it
            Ongoing instead — no dates needed.
          </p>
        </div>
      )}

      <div className="mt-6">
        <SuggestOpportunity onPosted={loadOpportunities} />
      </div>

      {user && myPosts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold text-brand-green">Your posted projects</h2>
          <p className="mt-1 text-sm text-brand-green/60">
            See who signed up and verify their hours right here — no email needed.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {myPosts.map((opp) => (
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
