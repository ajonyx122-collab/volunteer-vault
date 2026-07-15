import { isLogVerified, logDate } from './hourLogs'

// Pure function: how far along is this user on a given seasonal challenge,
// based on their raw hour_logs rows (same shape buildVaultData consumes).
// Only verified hours within the challenge window count.
export function computeChallengeProgress(challenge, hourLogRows) {
  const logs = (hourLogRows ?? []).filter(isLogVerified).filter((l) => {
    const day = logDate(l).slice(0, 10)
    if (day < challenge.startsOn || day > challenge.endsOn) return false
    if (challenge.category && l.opportunities?.category !== challenge.category) return false
    return true
  })
  const hoursSoFar = logs.reduce((sum, l) => sum + Number(l.hours), 0)
  const pct = Math.min(100, Math.round((hoursSoFar / challenge.goalHours) * 100))
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(`${challenge.endsOn}T23:59:59`) - new Date()) / (24 * 3600 * 1000)),
  )
  return {
    hoursSoFar,
    goalHours: challenge.goalHours,
    pct,
    complete: hoursSoFar >= challenge.goalHours,
    daysLeft,
  }
}
