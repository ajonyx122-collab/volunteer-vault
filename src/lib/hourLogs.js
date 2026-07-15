// Shared self-reported-hours helpers used by api.js (vault/leaderboards) and
// challenges.js — split out so challenges.js can reuse them without a
// circular import back into api.js.

// Local calendar date (not UTC) — new Date().toISOString() reports the UTC
// date, which rolls over to "tomorrow" every evening for anyone west of UTC
// (i.e. all of the US). That made served_on dates verify a day early and
// desync from the heatmap's local-time "today" cutoff. Always compute
// "today" from local getFullYear/Month/Date instead.
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// A plain 'YYYY-MM-DD' string parses as UTC midnight via `new Date(str)`,
// which can shift it to the wrong local day. Parse date-only strings as
// local time instead; pass timestamps (legacy created_at) straight through.
export function parseLogDate(dateStr) {
  return new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr)
}

// Self-reported rows (served_on set) are verified once that date has
// passed — nothing stored, just computed. Legacy rows (old event-code/org-
// verify flow, no served_on) fall back to their stored status so nothing
// already-verified appears to un-verify.
export function isLogVerified(l) {
  return l.served_on ? l.served_on <= todayStr() : l.status === 'verified'
}

// "When did the service happen" — served_on for self-reported rows, or
// created_at for legacy ones.
export function logDate(l) {
  return l.served_on ?? l.created_at
}

// Weekly streak: consecutive calendar weeks (ending this week) containing
// at least one *verified* log, keyed by when service happened. Shared by
// the vault, the Browse sidebar teaser, and leaderboards.
export function computeStreakWeeks(logs) {
  const weeksWithLogs = new Set(
    (logs ?? []).filter(isLogVerified).map((l) => {
      const d = parseLogDate(logDate(l))
      const firstJan = new Date(d.getFullYear(), 0, 1)
      return `${d.getFullYear()}-${Math.floor((d - firstJan) / (7 * 24 * 3600 * 1000))}`
    }),
  )
  let streakWeeks = 0
  const now = new Date()
  for (;;) {
    const check = new Date(now - streakWeeks * 7 * 24 * 3600 * 1000)
    const firstJan = new Date(check.getFullYear(), 0, 1)
    const key = `${check.getFullYear()}-${Math.floor((check - firstJan) / (7 * 24 * 3600 * 1000))}`
    if (!weeksWithLogs.has(key)) break
    streakWeeks++
  }
  return streakWeeks
}
