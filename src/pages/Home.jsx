import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, leaderboard } from '../data/mockData'
import { fetchOpportunities } from '../lib/api'
import CategoryChip from '../components/CategoryChip'
import OpportunityCard from '../components/OpportunityCard'
import StatPill from '../components/StatPill'

export default function Home() {
  const [interest, setInterest] = useState('')
  const [location, setLocation] = useState('')
  const [nearYou, setNearYou] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchOpportunities()
      .then((opps) => setNearYou(opps.slice(0, 4)))
      .catch(() => setNearYou([]))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (interest) params.set('q', interest)
    if (location) params.set('loc', location)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-green">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="font-display text-4xl font-extrabold text-cream-text sm:text-6xl">
            <span className="squiggle">Unlock</span> your community.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream-muted">
            Your people are already out here. Come find them — find opportunities, check in
            with a scan, and build a service record that colleges and employers can trust.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-card bg-card p-2 shadow-soft sm:flex-row"
          >
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="What are you into? (animals, art, cleanups...)"
              className="flex-1 rounded-pill border-none px-4 py-3 text-sm text-brand-green outline-none placeholder:text-brand-green/50"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Near you"
              className="rounded-pill border-none px-4 py-3 text-sm text-brand-green outline-none placeholder:text-brand-green/50 sm:w-40"
            />
            <button
              type="submit"
              className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
            >
              Find it
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StatPill value="12,400+" label="hours logged" tone="dark" />
            <StatPill value="380+" label="verified orgs" tone="dark" />
            <StatPill value="60" label="schools competing" tone="dark" />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} {...c} />
          ))}
        </div>
      </section>

      {/* Happening near you */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-brand-green">Happening near you</h2>
          <Link to="/browse" className="text-sm font-bold text-coral hover:underline">
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {nearYou.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} org={opp.org} />
          ))}
        </div>
      </section>

      {/* Your vault = your proof */}
      <section className="bg-brand-green">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:flex-row md:text-left">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-extrabold text-cream-text">
              Your vault = your proof.
            </h2>
            <p className="mt-3 max-w-md text-cream-muted">
              Every verified hour lands in your public vault — a shareable link colleges,
              scholarships, and employers can trust. No spreadsheets, no guessing.
            </p>
            <Link
              to="/profile"
              className="mt-6 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
            >
              volunteervault.org/u/you
            </Link>
          </div>
          <div className="flex flex-1 flex-wrap justify-center gap-3">
            <StatPill value="62" label="verified hours" tone="dark" />
            <StatPill value="9wk" label="streak" tone="dark" />
            <StatPill value="3" label="badges" tone="dark" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-extrabold text-brand-green">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', title: 'Find it', body: 'Browse opportunities by interest and location — see who\'s already going.' },
            { step: '2', title: 'Scan in', body: 'Show up, scan the org\'s QR code, and your hours start logging automatically.' },
            { step: '3', title: 'Vault it', body: 'Org verifies your hours and they land straight in your shareable vault.' },
          ].map((s) => (
            <div key={s.step} className="rounded-card border border-card-border bg-card p-6 text-center shadow-card">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-coral font-display font-extrabold text-cream-text">
                {s.step}
              </div>
              <h3 className="font-display font-bold text-brand-green">{s.title}</h3>
              <p className="mt-1 text-sm text-brand-green/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* School showdown */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-card border border-card-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold text-brand-green">School showdown</h2>
            <Link to="/leaderboards" className="text-sm font-bold text-coral hover:underline">
              Full leaderboard
            </Link>
          </div>
          <ol className="flex flex-col gap-2">
            {leaderboard.map((row, i) => (
              <li
                key={row.school}
                className="flex items-center justify-between rounded-pill bg-cream px-4 py-3 text-sm font-semibold text-brand-green"
              >
                <span>#{i + 1} {row.school}</span>
                <span className="text-gold-text">{row.hours.toLocaleString()} hrs</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Org CTA */}
      <section className="bg-gold">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <h2 className="font-display text-xl font-extrabold text-gold-text">
              Running an org? Post your opportunities free.
            </h2>
            <p className="mt-1 text-sm text-gold-text/80">
              Reach students actively looking for verified service hours.
            </p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            List an opportunity
          </Link>
        </div>
      </section>
    </div>
  )
}
