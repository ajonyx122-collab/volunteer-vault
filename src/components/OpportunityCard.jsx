import Link from 'next/link'
import { getCategoryMeta } from '../data/mockData'
import { opportunityPath } from '../lib/opportunityUrls'
import { CATEGORY_STYLES } from './categoryStyles'
import VerifiedBadge from './VerifiedBadge'
import OrgAvatar from './OrgAvatar'
import SaveButton from './SaveButton'

const MAX_TAGS = 3

function formatWhen(startsAt) {
  const date = new Date(startsAt)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// A listing's own state wins; fall back to its org's directory field. Country
// only lives on the org record (opportunities don't have their own column).
function formatLocation(opportunity, org) {
  const state = opportunity.state || org?.state
  const country = org?.country
  return [state, country].filter(Boolean).join(', ') || null
}

// The sticker-style listing card used everywhere (Home, Browse, landing
// pages, nonprofit pages, Projects). `bold` is kept for older callers; every
// card now has the punchy green border.
export default function OpportunityCard({ opportunity, org }) {
  const category = getCategoryMeta(opportunity.category)
  const tile = CATEGORY_STYLES[opportunity.category]?.chip ?? 'bg-cream text-brand-green'
  const spotsLeft = opportunity.capacity - opportunity.spotsFilled
  const isExternal = !!opportunity.externalUrl
  const location = formatLocation(opportunity, org)
  const href = opportunityPath(opportunity)
  const tags = opportunity.tags ?? []

  return (
    <div className="group flex w-full flex-col gap-3 rounded-card border-2 border-brand-green bg-card p-4 shadow-pop-soft transition-all hover:-translate-y-1 hover:shadow-pop sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        {/* Category tile — tilts a little on hover */}
        <Link
          href={href}
          aria-hidden
          tabIndex={-1}
          className={`flex h-12 w-12 shrink-0 -rotate-3 items-center justify-center rounded-2xl text-2xl shadow-card transition-transform group-hover:rotate-3 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-3xl ${tile}`}
        >
          {category?.icon ?? '💚'}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={href} className="font-display text-base font-extrabold leading-snug text-brand-green hover:underline sm:text-lg">
              {opportunity.title}
            </Link>
            {org?.verified && <VerifiedBadge verified />}
            {org?.isStudentLed && (
              <span className="rounded-pill bg-gold px-2 py-0.5 text-xs font-bold text-gold-text">🎓 Student-led</span>
            )}
            {org?.submittedBy && (
              <span className="rounded-pill bg-category-community-bg px-2 py-0.5 text-xs font-bold text-category-community-text">
                🙌 Community
              </span>
            )}
            {opportunity.vibeRating != null && (
              <span className="text-xs font-bold text-gold-text">★ {opportunity.vibeRating}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-brand-green/70">
            <OrgAvatar org={org} size="sm" />
            <span className="truncate">
              {org?.name} · {opportunity.isOngoing ? 'Ongoing' : formatWhen(opportunity.startsAt)}
              {opportunity.isOnline
                ? ' · 🌐 Online'
                : opportunity.distanceMiles != null && <> · {opportunity.distanceMiles} mi</>}
              {location && <> · {location}</>}
            </span>
          </div>
          {opportunity.reviewQuote && (
            <p className="mt-1 truncate text-sm italic text-brand-green/60">“{opportunity.reviewQuote}”</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
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
                <span
                  className={`rounded-pill px-2 py-0.5 font-semibold ${
                    spotsLeft > 0 && spotsLeft <= 5 ? 'bg-coral/15 text-coral' : 'bg-cream text-brand-green/70'
                  }`}
                >
                  {spotsLeft > 0 ? `${spotsLeft <= 5 ? '🔥 ' : ''}${spotsLeft} spots left` : 'Full'}
                </span>
              </>
            )}
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <span key={tag} className="rounded-pill bg-category-animals-bg px-2 py-0.5 font-semibold text-category-animals-text">
                {tag}
              </span>
            ))}
            {tags.length > MAX_TAGS && (
              <span className="rounded-pill px-1 py-0.5 font-semibold text-brand-green/50">+{tags.length - MAX_TAGS}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <SaveButton id={opportunity.id} />
        <Link
          href={href}
          className="flex-1 whitespace-nowrap rounded-pill border-2 border-brand-green bg-coral px-5 py-2 text-center text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none sm:flex-none"
        >
          {isExternal ? 'See details' : 'Count me in'}
        </Link>
      </div>
    </div>
  )
}
