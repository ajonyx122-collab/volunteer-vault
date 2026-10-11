import Link from 'next/link'
import OrgAvatar from './OrgAvatar'
import VerifiedBadge from './VerifiedBadge'
import GoalProgress from './GoalProgress'
import { FOUNDER_STATUS_LABELS } from '../lib/opportunityMapping'

export function founderLine(org) {
  return [
    org.founderName && `Founded by ${org.founderName}`,
    org.founderSchool,
    FOUNDER_STATUS_LABELS[org.founderStatus],
  ]
    .filter(Boolean)
    .join(' · ')
}

// Cards without a cover photo get a cheerful color band instead, picked
// from the org id so each one keeps its own color.
const BANDS = [
  { bg: 'from-[#FFF4CC] to-[#FDEBD2]', e: '💡' },
  { bg: 'from-[#DFF0E6] to-[#EAF4D9]', e: '🌱' },
  { bg: 'from-[#E4EEFB] to-[#E6E9F8]', e: '🚀' },
  { bg: 'from-[#FBE4EC] to-[#FBE7E4]', e: '💛' },
  { bg: 'from-[#F0EAFB] to-[#E4EEFB]', e: '✨' },
]
function bandFor(id = '') {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return BANDS[h % BANDS.length]
}

export default function StudentOrgCard({ org }) {
  const blurb = org.mission || org.description
  const band = bandFor(org.id)
  return (
    <Link
      href={`/student-led/${org.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-brand-green bg-card shadow-pop-soft transition-all hover:-translate-y-1 hover:shadow-pop"
    >
      <div className="relative h-28">
        {org.imageUrl ? (
          <img
            src={org.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full items-center justify-end bg-gradient-to-br pr-6 ${band.bg}`} aria-hidden>
            <span className="text-5xl opacity-60 transition-transform group-hover:rotate-12 group-hover:scale-110">{band.e}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 -rotate-3 rounded-pill bg-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-gold-text shadow-pop">
          🎓 Student-founded
        </span>
        {/* Logo sits half on the band, half on the card */}
        <div className="absolute -bottom-6 left-4 rounded-full border-4 border-card bg-card">
          <OrgAvatar org={org} size="md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-lg font-extrabold leading-tight text-brand-green">{org.name}</p>
          <VerifiedBadge verified={org.verified} />
        </div>
        {founderLine(org) && <p className="mt-0.5 text-xs font-semibold text-coral">{founderLine(org)}</p>}
        {blurb && <p className="mt-2 line-clamp-3 text-sm text-brand-green/70">{blurb}</p>}
        <GoalProgress org={org} compact />
        <div className="mt-auto flex flex-wrap gap-2 pt-4 text-[11px] font-bold text-brand-green/70">
          <span className="rounded-pill bg-cream px-2.5 py-1">🙋 {org.impact?.listings ?? 0} opportunities</span>
          {org.impact?.hours > 0 && <span className="rounded-pill bg-cream px-2.5 py-1">⏱️ {org.impact.hours} hrs</span>}
          {org.location && <span className="rounded-pill bg-cream px-2.5 py-1">📍 {org.location}</span>}
        </div>
      </div>
    </Link>
  )
}
