// A founder's self-reported goal ("500 meals packed by December"), shown as a
// progress bar. Renders nothing until they've set a title + target.
export default function GoalProgress({ org, compact = false }) {
  if (!org?.goalTitle || !org.goalTarget) return null
  const current = org.goalCurrent ?? 0
  const pct = Math.min(100, Math.round((current / org.goalTarget) * 100))
  const fmt = (n) => Number(n).toLocaleString()
  return (
    <div className={compact ? 'mt-3' : 'rounded-card border border-card-border bg-card p-5 shadow-card'}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={`font-bold text-brand-green ${compact ? 'text-xs' : ''}`}>🎯 {org.goalTitle}</p>
        <p className={`font-semibold text-brand-green/60 ${compact ? 'text-[11px]' : 'text-sm'}`}>
          {fmt(current)} / {fmt(org.goalTarget)} {org.goalUnit} · {pct}%
        </p>
      </div>
      <div className={`mt-1.5 overflow-hidden rounded-pill bg-cream ${compact ? 'h-2' : 'h-3'}`}>
        <div className="h-full rounded-pill bg-gold" style={{ width: `${pct}%` }} />
      </div>
      {!compact && (
        <p className="mt-1.5 text-[11px] text-brand-green/40">Progress is updated by the founder.</p>
      )}
    </div>
  )
}
