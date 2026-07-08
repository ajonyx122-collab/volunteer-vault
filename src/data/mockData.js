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
  { id: 'seniors', label: 'Seniors', icon: '👵' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'faith', label: 'Faith', icon: '🙏' },
  { id: 'veterans', label: 'Veterans', icon: '🎖️' },
  { id: 'disaster', label: 'Disaster relief', icon: '⛑️' },
  { id: 'gardening', label: 'Gardening', icon: '🌻' },
]

export function getCategoryMeta(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)
}

// Tags orgs can put on a listing — the niche layer on top of categories.
export const TAG_OPTIONS = [
  'good for crews',
  'chill first-timer pick',
  'no experience needed',
  'counts for NHS',
  'one-time',
  'recurring',
  'outdoors',
  'indoors',
  'family friendly',
  'leadership role',
  'physical work',
  'creative work',
]

// School showdown teaser on the home page. Real leaderboards are Phase 4.
export const leaderboard = [
  { school: 'Lincoln High School', hours: 1420 },
  { school: 'Westview Academy', hours: 1310 },
  { school: 'Riverside High', hours: 1185 },
  { school: 'Franklin Prep', hours: 960 },
]
