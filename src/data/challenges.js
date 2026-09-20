// Seasonal challenges, hand-edited a few times a year — no admin UI needed
// for something that changes this rarely (see CATEGORIES above for the same
// pattern). Add a new entry ahead of time; getActiveChallenge picks whichever
// one's window contains today, so the next season can be queued without
// deleting the current one. When two windows overlap, the FIRST match in this
// array wins — so put the more specific/short window (e.g. Halloween) above
// the broad one (e.g. the whole fall) it sits inside.
export const SEASONAL_CHALLENGES = [
  {
    id: 'halloween-2026',
    title: 'Halloween Helper Challenge',
    blurb: 'Log hours before Halloween to collect the whole spooky set. 🎃',
    icon: '🎃',
    startsOn: '2026-10-01',
    endsOn: '2026-10-31',
    goalHours: 10,
    category: null, // null = any cause counts
    badgeLabel: 'Halloween Helper',
    // "Collectibles" — cute items you unlock as your logged hours pass each
    // mark during the challenge window (see ChallengeBanner). Purely for fun;
    // `at` is the hours needed. Keep the last one at goalHours.
    collectibles: [
      { at: 2, emoji: '🍬', name: 'Candy' },
      { at: 4, emoji: '🕸️', name: 'Web' },
      { at: 6, emoji: '🦇', name: 'Bat' },
      { at: 8, emoji: '👻', name: 'Ghost' },
      { at: 10, emoji: '🎃', name: 'Jack-o’-lantern' },
    ],
  },
  {
    id: 'fall-2026',
    title: 'Fall of Service Challenge',
    blurb: 'Log hours this fall and collect a cozy set of autumn treasures.',
    icon: '🍂',
    startsOn: '2026-09-01',
    endsOn: '2026-11-30',
    goalHours: 20,
    category: null,
    badgeLabel: 'Fall of Service',
    collectibles: [
      { at: 2, emoji: '🍂', name: 'First Leaf' },
      { at: 5, emoji: '🌰', name: 'Acorn' },
      { at: 8, emoji: '🍎', name: 'Apple' },
      { at: 12, emoji: '🎃', name: 'Pumpkin' },
      { at: 16, emoji: '🥧', name: 'Pie' },
      { at: 20, emoji: '🍁', name: 'Golden Maple' },
    ],
  },
  {
    id: 'summer-2026',
    title: 'Summer Kickoff Challenge',
    blurb: 'Log 15 hours before August 31 and earn the Summer Starter badge.',
    icon: '☀️',
    startsOn: '2026-06-01',
    endsOn: '2026-08-31',
    goalHours: 15,
    category: null,
    badgeLabel: 'Summer Starter',
  },
]

export function getActiveChallenge(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return SEASONAL_CHALLENGES.find((c) => today >= c.startsOn && today <= c.endsOn) ?? null
}
