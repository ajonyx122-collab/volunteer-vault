import { fetchOpportunitiesServer, fetchLeaderboardDataServer, fetchStudentOrgsServer } from '../lib/api.server'
import { buildLeaderboards } from '../lib/api'
import HomeView from '../components/HomeView'

export const metadata = {
  title: 'Volunteer Opportunities for High School & College Students',
  description:
    'Browse real volunteer opportunities near you by cause and location, RSVP, and build a verified service record for college applications, NHS, and scholarships — free for students and organizations.',
  alternates: { canonical: '/' },
}

export const revalidate = 300

export default async function HomePage() {
  const [opportunities, leaderboard, studentOrgs] = await Promise.all([
    fetchOpportunitiesServer().catch(() => []),
    fetchLeaderboardDataServer().catch(() => ({ rows: [], profiles: [] })),
    fetchStudentOrgsServer().catch(() => []),
  ])
  const spotlightOrgs = studentOrgs.filter((o) => o.spotlight && o.verified).slice(0, 2)
  const topVolunteers = buildLeaderboards(leaderboard.rows, leaderboard.profiles).allTime.slice(0, 3)

  return <HomeView opportunities={opportunities} topVolunteers={topVolunteers} spotlightOrgs={spotlightOrgs} />
}
