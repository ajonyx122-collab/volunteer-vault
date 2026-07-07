import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import { CATEGORY_STYLES } from './categoryStyles'

const CAUSE_BAR_COLORS = {
  environment: 'bg-category-environment-text',
  sports: 'bg-category-sports-text',
  food: 'bg-category-food-text',
  art: 'bg-category-art-text',
  music: 'bg-category-music-text',
  medicine: 'bg-category-medicine-text',
  animals: 'bg-category-animals-text',
  education: 'bg-category-education-text',
  community: 'bg-category-community-text',
}

export default function VaultView({ user, activity, isOwner }) {
  const [copied, setCopied] = useState(false)
  const totalCauseHours = user.causes.reduce((sum, c) => sum + c.hours, 0)
  const vaultUrl = `volunteervault.org/u/${user.username}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`https://${vaultUrl}`)
    } catch {
      // clipboard API unavailable (e.g. insecure context) — link is still shown on screen
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-brand-green">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cream-muted/30 font-display text-3xl font-extrabold text-cream-text">
            {user.displayName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-cream-text">{user.displayName}</h1>
            <p className="text-cream-muted">
              {user.school} · Class of {user.gradYear}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleCopyLink}
              className="rounded-pill bg-gold px-5 py-2 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
            >
              {copied ? 'Link copied! ✓' : isOwner ? 'Share my vault' : 'Copy link'}
            </button>
            <Link
              to={`/certificate/${user.username}`}
              className="rounded-pill border border-cream-muted px-5 py-2 text-sm font-bold text-cream-text transition-colors hover:bg-brand-green-light"
            >
              Certificate
            </Link>
          </div>
          <p className="text-xs text-cream-muted">{vaultUrl}</p>
          {!isOwner && (
            <p className="rounded-pill bg-brand-green-light/60 px-3 py-1 text-xs font-semibold text-cream-text">
              ✓ Verified service record — VolunteerVault
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard value={user.verifiedHours} label="Verified hours" />
          <StatCard value={`${user.streakWeeks}wk`} label="Streak" />
          <StatCard value={user.badges.filter((b) => b.earned).length} label="Badges" />
          <StatCard value={user.causes.length} label="Causes" />
        </div>

        {/* Badge shelf */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold text-brand-green">Badge shelf</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex w-36 flex-col items-center gap-2 rounded-card border p-4 text-center shadow-card ${
                  badge.earned ? 'border-card-border bg-card' : 'border-dashed border-card-border bg-cream'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                    badge.earned ? 'bg-gold text-gold-text' : 'bg-card-border text-brand-green/40'
                  }`}
                >
                  {badge.earned ? '🏅' : '🔒'}
                </div>
                <p className="text-sm font-bold text-brand-green">{badge.label}</p>
                {!badge.earned && badge.targetHours != null && (
                  <p className="text-xs text-brand-green/50">
                    {Math.max(0, Math.round(badge.targetHours - badge.progressHours))} hrs to go
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Where the hours went */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold text-brand-green">Where the hours went</h2>
          {user.causes.length === 0 && (
            <p className="mt-4 rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
              Nothing here yet — your first shift starts the story.{' '}
              <Link to="/browse" className="font-bold text-coral hover:underline">Find one</Link>
            </p>
          )}
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-pill">
            {user.causes.map((c) => (
              <div
                key={c.category}
                className={CAUSE_BAR_COLORS[c.category]}
                style={{ width: `${(c.hours / totalCauseHours) * 100}%` }}
                title={`${getCategoryMeta(c.category)?.label}: ${c.hours} hrs`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {user.causes.map((c) => {
              const meta = getCategoryMeta(c.category)
              return (
                <span
                  key={c.category}
                  className={`rounded-pill px-3 py-1 text-xs font-bold ${CATEGORY_STYLES[c.category]?.chip}`}
                >
                  {meta?.icon} {meta?.label} · {c.hours}h
                </span>
              )
            })}
          </div>
        </section>

        {/* Recent activity */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold text-brand-green">Recent activity</h2>
          <div className="mt-4 flex flex-col gap-3">
            {activity.length === 0 && (
              <p className="rounded-card border border-card-border bg-card p-5 text-sm text-brand-green/60 shadow-card">
                No logged hours yet — RSVP to something and get out there.
              </p>
            )}
            {activity.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-card-border bg-card p-4 shadow-card"
              >
                <div>
                  <p className="font-bold text-brand-green">{entry.title}</p>
                  <p className="text-sm text-brand-green/60">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                    {entry.hours} hrs
                  </p>
                </div>
                <span
                  className={`rounded-pill px-3 py-1 text-xs font-bold ${
                    entry.status === 'verified'
                      ? 'bg-category-environment-bg text-category-environment-text'
                      : 'bg-card-border text-brand-green/60'
                  }`}
                >
                  {entry.status === 'verified' ? '✓ Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-4 text-center shadow-card">
      <p className="font-display text-2xl font-extrabold text-brand-green">{value}</p>
      <p className="text-xs font-semibold text-brand-green/60">{label}</p>
    </div>
  )
}
