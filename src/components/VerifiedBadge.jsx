export default function VerifiedBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-category-environment-bg px-2 py-0.5 text-xs font-bold text-category-environment-text">
        <span aria-hidden="true">✓</span> Verified
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-card-border px-2 py-0.5 text-xs font-bold text-brand-green/70">
      Pending
    </span>
  )
}
