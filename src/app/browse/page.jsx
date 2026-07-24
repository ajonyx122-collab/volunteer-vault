import { Suspense } from 'react'
import { fetchOpportunitiesServer } from '../../lib/api.server'
import BrowseView from '../../components/BrowseView'

export const metadata = {
  title: 'Browse Volunteer Opportunities',
  description:
    'Search and filter real volunteer opportunities by cause, location, age, and commitment — find your next shift and RSVP free.',
  alternates: { canonical: '/browse' },
}

export const revalidate = 300

export default async function BrowsePage() {
  const opportunities = await fetchOpportunitiesServer().catch(() => [])
  return (
    // BrowseView reads the ?category=/?q= query via useSearchParams, which
    // requires a Suspense boundary so Next can still prerender the shell.
    <Suspense fallback={null}>
      <BrowseView initialOpportunities={opportunities} />
    </Suspense>
  )
}
