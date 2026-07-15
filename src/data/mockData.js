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

// Curated badge copy per cause, earned once a volunteer logs 10+ hours in
// that category (see buildVaultData in src/lib/api.js).
export const CAUSE_BADGE_COPY = {
  environment: { label: 'Environment ally', icon: '🌱' },
  sports: { label: 'Team spirit', icon: '⚽' },
  food: { label: 'Food security hero', icon: '🍲' },
  art: { label: 'Arts booster', icon: '🎨' },
  music: { label: 'Music maker', icon: '🎵' },
  medicine: { label: 'Health helper', icon: '🩺' },
  animals: { label: 'Animal advocate', icon: '🐾' },
  education: { label: 'Education champion', icon: '📚' },
  community: { label: 'Community builder', icon: '🤝' },
  seniors: { label: 'Senior support star', icon: '👵' },
  tech: { label: 'Tech mentor', icon: '💻' },
  faith: { label: 'Faith in action', icon: '🙏' },
  veterans: { label: 'Veterans ally', icon: '🎖️' },
  disaster: { label: 'Disaster responder', icon: '⛑️' },
  gardening: { label: 'Green thumb', icon: '🌻' },
}

export function getCauseBadgeCopy(categoryId) {
  if (CAUSE_BADGE_COPY[categoryId]) return CAUSE_BADGE_COPY[categoryId]
  const meta = getCategoryMeta(categoryId)
  return { label: meta ? `${meta.label} regular` : 'Cause regular', icon: meta?.icon ?? '💚' }
}

// Tags orgs can put on a listing — the niche layer on top of categories.
export const TAG_OPTIONS = [
  'good for crews',
  'chill first-timer pick',
  'no experience needed',
  'counts for school hours',
  'counts for club hours',
  'one-time',
  'recurring',
  'outdoors',
  'indoors',
  'family friendly',
  'leadership role',
  'physical work',
  'creative work',
]

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]
