// Progress card for the active seasonal challenge (src/data/challenges.js).
// `progress` is a computeChallengeProgress() result, or null if the
// signed-out/no-logs case should show a plain teaser instead.
export default function ChallengeBanner({ challenge, progress, compact = false }) {
  if (!challenge) return null

  return (
    <div className={`rounded-card border border-card-border bg-card shadow-card ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-center gap-3">
        <span className={compact ? 'text-2xl' : 'text-3xl'} aria-hidden>
          {challenge.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-display font-extrabold text-brand-green ${compact ? 'text-sm' : 'text-lg'}`}>
            {challenge.title}
          </p>
          {!compact && <p className="mt-0.5 text-xs text-brand-green/60">{challenge.blurb}</p>}
        </div>
        {progress?.complete && (
          <span className="shrink-0 rounded-pill bg-category-environment-bg px-2.5 py-1 text-xs font-bold text-category-environment-text">
            ✓ Done
          </span>
        )}
      </div>

      {progress ? (
        <>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-pill bg-card-border">
            <div className="h-full rounded-pill bg-gold" style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-brand-green/60">
            {progress.hoursSoFar} / {progress.goalHours} hrs
            {!progress.complete && progress.daysLeft > 0 ? ` · ${progress.daysLeft} days left` : ''}
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs font-semibold text-brand-green/60">
          Join free and log hours to track your progress.
        </p>
      )}
    </div>
  )
}
