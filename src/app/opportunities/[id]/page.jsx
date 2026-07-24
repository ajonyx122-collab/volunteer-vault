import { fetchOpportunityServer } from '../../../lib/api.server'
import { getCategoryMeta } from '../../../data/mockData'
import OpportunityDetailView from '../../../components/OpportunityDetailView'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { id } = await params
  const opportunity = await fetchOpportunityServer(id).catch(() => null)
  if (!opportunity) {
    return { title: 'Opportunity not found' }
  }

  const category = getCategoryMeta(opportunity.category)
  const orgName = opportunity.org?.name
  const location = opportunity.isOnline
    ? 'Online'
    : [opportunity.city, opportunity.state].filter(Boolean).join(', ')
  const description = (
    opportunity.description?.trim() ||
    `${category?.label ?? 'Volunteer'} opportunity${orgName ? ` with ${orgName}` : ''}${location ? ` in ${location}` : ''} — RSVP free on VolunteerVault and log verified service hours.`
  ).slice(0, 160)

  return {
    title: opportunity.title,
    description,
    alternates: { canonical: `/opportunities/${opportunity.id}` },
    openGraph: {
      title: opportunity.title,
      description,
      type: 'website',
      images: opportunity.org?.imageUrl ? [opportunity.org.imageUrl] : undefined,
    },
  }
}

export default async function OpportunityDetailPage({ params }) {
  const { id } = await params
  const opportunity = await fetchOpportunityServer(id).catch(() => null)
  return <OpportunityDetailView id={id} initialOpportunity={opportunity} />
}
