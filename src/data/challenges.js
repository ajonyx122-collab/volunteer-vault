// Seasonal challenges, hand-edited a few times a year — no admin UI needed
// for something that changes this rarely (see CATEGORIES above for the same
// pattern). Add a new entry ahead of time; getActiveChallenge picks whichever
// one's window contains today, so the next season can be queued without
// deleting the current one.
export const SEASONAL_CHALLENGES = [
  {
    id: 'summer-2026',
    title: 'Summer Kickoff Challenge',
    blurb: 'Log 15 hours before August 31 and earn the Summer Starter badge.',
    icon: '☀️',
    startsOn: '2026-06-01',
    endsOn: '2026-08-31',
    goalHours: 15,
    category: null, // null = any cause counts
    badgeLabel: 'Summer Starter',
  },
]

export function getActiveChallenge(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return SEASONAL_CHALLENGES.find((c) => today >= c.startsOn && today <= c.endsOn) ?? null
}
