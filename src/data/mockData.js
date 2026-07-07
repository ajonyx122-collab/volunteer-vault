// Static app data. Everything dynamic (orgs, opportunities, reviews, profiles,
// hours) now lives in Supabase — see src/lib/api.js.

export const CATEGORIES = [
  { id: 'environment', label: 'Environment', icon: '🌱' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'medicine', label: 'Medicine', icon: '🩺' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'community', label: 'Community', icon: '🤝' },
]

export function getCategoryMeta(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)
}

// School showdown teaser on the home page. Real leaderboards are Phase 4.
export const leaderboard = [
  { school: 'Lincoln High School', hours: 1420 },
  { school: 'Westview Academy', hours: 1310 },
  { school: 'Riverside High', hours: 1185 },
  { school: 'Franklin Prep', hours: 960 },
]
