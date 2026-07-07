// Mock data for Phase 1. Shapes mirror the real Postgres/Supabase schema
// (profiles, organizations, opportunities, signups, hour_logs) so swapping
// in real Supabase queries later is a drop-in replacement.

export const CATEGORIES = [
  { id: 'environment', label: 'Environment', icon: '🌱' },
  { id: 'sports', label: 'Sports & Food', icon: '🍲' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'medicine', label: 'Medicine', icon: '🩺' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
]

export const organizations = [
  {
    id: 'org-1',
    name: 'Green Shore Coalition',
    verified: true,
    description: 'Community-run beach and waterway cleanups across the county.',
    location: 'Riverside Park',
  },
  {
    id: 'org-2',
    name: 'Second Bowl Food Rescue',
    verified: true,
    description: 'Rescuing surplus food and getting it to families who need it.',
    location: 'Downtown Community Kitchen',
  },
  {
    id: 'org-3',
    name: 'Paws & Purpose Shelter',
    verified: true,
    description: 'No-kill animal shelter running on volunteer power.',
    location: 'Westside Animal Shelter',
  },
  {
    id: 'org-4',
    name: 'Brushstrokes Youth Arts',
    verified: false,
    description: 'Free art programs for elementary schoolers, run by teen mentors.',
    location: 'Lincoln Community Center',
  },
  {
    id: 'org-5',
    name: 'Sunrise Senior Companions',
    verified: true,
    description: 'Friendly visits, music, and games with residents at local senior homes.',
    location: 'Maple Grove Senior Living',
  },
]

export const opportunities = [
  {
    id: 'opp-1',
    orgId: 'org-1',
    title: 'Riverside Beach Cleanup',
    category: 'environment',
    description:
      "Grab a bag and gloves — we're clearing plastic and debris along the river trail before the summer crowds hit. Snacks and music provided.",
    startsAt: '2026-07-12T09:00:00',
    durationHours: 2,
    address: 'Riverside Park, Main Entrance',
    capacity: 40,
    spotsFilled: 28,
    minAge: 12,
    vibeRating: 4.8,
    reviewQuote: 'Way more fun than I expected — bring a hoodie, it\'s breezy by the water.',
    goingFriends: ['Maya', 'Theo'],
    distanceMiles: 1.2,
    tags: ['good for crews', 'chill first-timer pick'],
  },
  {
    id: 'opp-2',
    orgId: 'org-2',
    title: 'Weekend Food Rescue Sort',
    category: 'sports',
    description:
      'Sort and pack rescued grocery surplus into family boxes. Indoors, easy pace, great for a first shift.',
    startsAt: '2026-07-13T13:00:00',
    durationHours: 3,
    address: 'Downtown Community Kitchen',
    capacity: 20,
    spotsFilled: 12,
    minAge: 14,
    vibeRating: 4.6,
    reviewQuote: 'Organized and welcoming, the staff actually explain what you\'re doing.',
    goingFriends: ['Jordan'],
    distanceMiles: 3.4,
    tags: ['chill first-timer pick'],
  },
  {
    id: 'opp-3',
    orgId: 'org-3',
    title: 'Shelter Dog Walking Shift',
    category: 'animals',
    description:
      'Walk and socialize shelter dogs so they stay happy and adoptable. Comfortable shoes required.',
    startsAt: '2026-07-11T16:00:00',
    durationHours: 2,
    address: 'Westside Animal Shelter',
    capacity: 15,
    spotsFilled: 15,
    minAge: 13,
    vibeRating: 4.9,
    reviewQuote: 'Full every week for a reason. Sign up early!',
    goingFriends: ['Maya', 'Sam', 'Priya'],
    distanceMiles: 2.8,
    tags: ['good for crews'],
  },
  {
    id: 'opp-4',
    orgId: 'org-4',
    title: 'After-School Art Studio Helpers',
    category: 'art',
    description:
      'Help elementary kids with painting and craft projects. No experience needed, just patience and good vibes.',
    startsAt: '2026-07-14T15:30:00',
    durationHours: 1.5,
    address: 'Lincoln Community Center',
    capacity: 10,
    spotsFilled: 4,
    minAge: 14,
    vibeRating: 4.7,
    reviewQuote: 'The kids will remember you. Bring an apron.',
    goingFriends: [],
    distanceMiles: 4.1,
    tags: ['chill first-timer pick'],
  },
  {
    id: 'opp-5',
    orgId: 'org-5',
    title: 'Senior Center Music & Games Afternoon',
    category: 'music',
    description:
      'Play board games, cards, and requested songs with residents. Bring an instrument if you\'ve got one.',
    startsAt: '2026-07-13T14:00:00',
    durationHours: 2,
    address: 'Maple Grove Senior Living',
    capacity: 12,
    spotsFilled: 7,
    minAge: 12,
    vibeRating: 5.0,
    reviewQuote: 'Genuinely one of the sweetest hours of my week.',
    goingFriends: ['Theo'],
    distanceMiles: 5.6,
    tags: ['good for crews'],
  },
  {
    id: 'opp-6',
    orgId: 'org-1',
    title: 'Trailhead Native Planting Day',
    category: 'environment',
    description:
      'Plant native shrubs and grasses to fight erosion along the north trailhead. Tools and gloves provided.',
    startsAt: '2026-07-19T09:00:00',
    durationHours: 3,
    address: 'North Trailhead Lot',
    capacity: 25,
    spotsFilled: 6,
    minAge: 12,
    vibeRating: 4.5,
    reviewQuote: 'Dig-in-the-dirt fun, wear clothes you don\'t mind getting muddy.',
    goingFriends: [],
    distanceMiles: 6.0,
    tags: [],
  },
]

export const currentUser = {
  id: 'user-1',
  username: 'ajmartinez',
  displayName: 'AJ Martinez',
  school: 'Lincoln High School',
  gradYear: 2027,
  avatarUrl: null,
  verifiedHours: 62,
  streakWeeks: 9,
  causes: [
    { category: 'environment', hours: 24 },
    { category: 'animals', hours: 18 },
    { category: 'sports', hours: 12 },
    { category: 'music', hours: 8 },
  ],
  badges: [
    { id: 'first-cleanup', label: 'First cleanup', earned: true },
    { id: '50-hours', label: '50 hours', earned: true },
    { id: 'animal-advocate', label: 'Animal advocate', earned: true },
    { id: '100-hours', label: '100 hours', earned: false, progressHours: 62, targetHours: 100 },
  ],
}

export const activityLog = [
  {
    id: 'act-1',
    opportunityId: 'opp-3',
    title: 'Shelter Dog Walking Shift',
    date: '2026-07-04',
    hours: 2,
    status: 'verified',
  },
  {
    id: 'act-2',
    opportunityId: 'opp-1',
    title: 'Riverside Beach Cleanup',
    date: '2026-06-27',
    hours: 2,
    status: 'verified',
  },
  {
    id: 'act-3',
    opportunityId: 'opp-5',
    title: 'Senior Center Music & Games Afternoon',
    date: '2026-06-21',
    hours: 2,
    status: 'pending',
  },
]

export const leaderboard = [
  { school: 'Lincoln High School', hours: 1420 },
  { school: 'Westview Academy', hours: 1310 },
  { school: 'Riverside High', hours: 1185 },
  { school: 'Franklin Prep', hours: 960 },
]

export function getOpportunityWithOrg(opportunityId) {
  const opp = opportunities.find((o) => o.id === opportunityId)
  if (!opp) return null
  const org = organizations.find((o) => o.id === opp.orgId)
  return { ...opp, org }
}

export function getCategoryMeta(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)
}
