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

export default function StudentOrgCard({ org }) {
  const blurb = org.mission || org.description
  return (
    <Link
      href={`/student-led/${org.id}`}
      className="flex flex-col overflow-hidden rounded-card border border-card-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop-soft"
    >
      {org.imageUrl && (
        <div className="-mx-5 -mt-5 mb-4 h-28 bg-cream">
          <img src={org.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <OrgAvatar org={org} size="md" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-extrabold leading-tight text-brand-green">{org.name}</p>
            <VerifiedBadge verified={org.verified} />
          </div>
          <p className="mt-0.5 text-xs font-semibold text-coral">🎓 {founderLine(org) || 'Student-founded'}</p>
        </div>
      </div>
      {blurb && <p className="mt-3 line-clamp-3 text-sm text-brand-green/70">{blurb}</p>}
      <GoalProgress org={org} compact />
      <div className="mt-auto flex flex-wrap gap-2 pt-4 text-[11px] font-bold text-brand-green/70">
        <span className="rounded-pill bg-cream px-2.5 py-1">{org.impact?.listings ?? 0} opportunities</span>
        {org.impact?.hours > 0 && <span className="rounded-pill bg-cream px-2.5 py-1">{org.impact.hours} volunteer hrs</span>}
        {org.location && <span className="rounded-pill bg-cream px-2.5 py-1">📍 {org.location}</span>}
      </div>
    </Link>
  )
}
