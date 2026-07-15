import { Link } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import VerifiedBadge from './VerifiedBadge'
import OrgAvatar from './OrgAvatar'

function formatWhen(startsAt) {
  const date = new Date(startsAt)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// bold=true swaps the thin border/soft shadow for the punchier green-
// bordered, hard-shadow card style (Community page) without touching the
// default look everywhere else this card is used (Home, Browse).
export default function OpportunityCard({ opportunity, org, bold = false }) {
  const category = getCategoryMeta(opportunity.category)
  const spotsLeft = opportunity.capacity - opportunity.spotsFilled
  const isExternal = !!opportunity.externalUrl

  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-card bg-card p-4 transition-all sm:flex-row sm:items-center ${
        bold
          ? 'border-2 border-brand-green shadow-pop-soft hover:-translate-y-1 hover:shadow-pop'
          : 'border border-card-border shadow-card hover:-translate-y-1 hover:shadow-pop'
      }`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-cream text-2xl">
        {category?.icon ?? '💚'}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/opportunities/${opportunity.id}`} className="font-display font-bold text-brand-green hover:underline">
            {opportunity.title}
          </Link>
          {org?.verified && <VerifiedBadge verified />}
          {org?.submittedBy && (
            <span className="rounded-pill bg-category-community-bg px-2 py-0.5 text-xs font-bold text-category-community-text">
              🙌 Community organized
            </span>
          )}
          {opportunity.vibeRating != null && (
            <span className="text-xs font-bold text-gold-text">★ {opportunity.vibeRating}</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-brand-green/70">
          <OrgAvatar org={org} size="sm" />
          <span className="truncate">
            {org?.name} · {opportunity.isOngoing ? 'Ongoing' : formatWhen(opportunity.startsAt)}
            {opportunity.isOnline
              ? ' · 🌐 Online'
              : opportunity.distanceMiles != null && <> · {opportunity.distanceMiles} mi</>}
          </span>
        </div>
        {opportunity.reviewQuote && (
          <p className="mt-1 truncate text-sm italic text-brand-green/60">“{opportunity.reviewQuote}”</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {isExternal ? (
            <>
              <span className="rounded-pill bg-category-tech-bg px-2 py-0.5 font-semibold text-category-tech-text">
                🔗 Register on their site
              </span>
              {opportunity.hoursEstimate && (
                <span className="rounded-pill bg-cream px-2 py-0.5 font-semibold text-brand-green/70">
                  ⏱ {opportunity.hoursEstimate}
                </span>
              )}
            </>
          ) : (
            <>
              {opportunity.goingFriends.length > 0 && (
                <span className="rounded-pill bg-category-music-bg px-2 py-0.5 font-semibold text-category-music-text">
                  {opportunity.goingFriends.length} friend{opportunity.goingFriends.length > 1 ? 's' : ''} going
                </span>
              )}
              <span className="rounded-pill bg-cream px-2 py-0.5 font-semibold text-brand-green/70">
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
              </span>
            </>
          )}
          {opportunity.tags.map((tag) => (
            <span key={tag} className="rounded-pill bg-category-animals-bg px-2 py-0.5 font-semibold text-category-animals-text">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <Link
        to={`/opportunities/${opportunity.id}`}
        className={`shrink-0 rounded-pill bg-coral px-5 py-2 text-center text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none ${
          bold ? 'border-2 border-brand-green' : ''
        }`}
      >
        {isExternal ? 'See details' : 'Count me in'}
      </Link>
    </div>
  )
}
