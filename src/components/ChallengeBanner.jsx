'use client'

import { useEffect } from 'react'
import { fireConfetti } from '../lib/confetti'
import { playAchievement } from '../lib/sound'

// Progress card for the active seasonal challenge (src/data/challenges.js).
// `progress` is a computeChallengeProgress() result, or null if the
// signed-out/no-logs case should show a plain teaser instead.
export default function ChallengeBanner({ challenge, progress, compact = false }) {
  const collectibles = challenge?.collectibles ?? []
  const hoursSoFar = progress?.hoursSoFar ?? 0
  const collectedCount = collectibles.filter((c) => hoursSoFar >= c.at).length

  // Celebrate when a NEW collectible unlocks (e.g. the user just logged hours
  // and came back here). We store the last-celebrated count per challenge in
  // localStorage: the first time we see a challenge on this device we quietly
  // set the baseline (no surprise confetti for already-earned items), then any
  // increase after that pops confetti + a chime. Deduped across the home/browse
  // banners via the shared key.
  useEffect(() => {
    if (!challenge || !progress || collectibles.length === 0) return
    const key = `vv_celebrated_${challenge.id}`
    let prev = null
    try {
      const v = localStorage.getItem(key)
      prev = v === null ? null : parseInt(v, 10) || 0
    } catch {
      prev = null
    }
    if (prev === null) {
      try {
        localStorage.setItem(key, String(collectedCount))
      } catch {
        /* ignore */
      }
      return
    }
    if (collectedCount > prev) {
      fireConfetti()
      playAchievement()
    }
    if (collectedCount !== prev) {
      try {
        localStorage.setItem(key, String(collectedCount))
      } catch {
        /* ignore */
      }
    }
  }, [challenge?.id, progress, collectedCount, collectibles.length])

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
          Join free and log hours to start your collection.
        </p>
      )}

      {collectibles.length > 0 && (
        <div className="mt-3 border-t border-card-border pt-3">
          {!compact && (
            <p className="mb-2 text-xs font-bold text-brand-green/70">
              Your collection{' '}
              <span className="font-semibold text-brand-green/40">
                · {collectedCount}/{collectibles.length}
              </span>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {collectibles.map((c) => {
              const unlocked = hoursSoFar >= c.at
              return (
                <div
                  key={c.at}
                  title={unlocked ? `${c.name} — collected!` : `${c.name} — reach ${c.at} hrs to unlock`}
                  className={`flex flex-col items-center rounded-card border px-2 py-1.5 transition-all ${
                    unlocked
                      ? 'border-gold bg-category-food-bg'
                      : 'border-dashed border-card-border bg-cream'
                  }`}
                >
                  <span
                    className={`${compact ? 'text-lg' : 'text-2xl'} leading-none ${
                      unlocked ? '' : 'opacity-30 grayscale'
                    }`}
                    aria-hidden
                  >
                    {c.emoji}
                  </span>
                  {!compact && (
                    <span
                      className={`mt-1 text-[10px] font-bold ${
                        unlocked ? 'text-gold-text' : 'text-brand-green/40'
                      }`}
                    >
                      {unlocked ? c.name : `${c.at} hr`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
