import { permanentRedirect } from 'next/navigation'
import { fetchOpportunityServer } from '../../../lib/api.server'
import { opportunityPath } from '../../../lib/opportunityUrls'
import {
  buildOpportunityMetadata,
  buildOpportunityTrail,
  buildOpportunityJsonLd,
} from '../../../lib/opportunityMeta'
import OpportunityDetailView from '../../../components/OpportunityDetailView'

// Legacy id route. Once a listing has a slug (migration-034), this 308-redirects
// to the descriptive /volunteer/<city>/<org>/<slug> URL — protecting every
// already-indexed /opportunities/<id> link. Until the migration lands (slug
// absent), it still renders the detail page directly, so nothing breaks.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { id } = await params
  const opportunity = await fetchOpportunityServer(id).catch(() => null)
  if (!opportunity) return { title: 'Opportunity not found' }
  return buildOpportunityMetadata(opportunity)
}

export default async function OpportunityDetailPage({ params }) {
  const { id } = await params
  const opportunity = await fetchOpportunityServer(id).catch(() => null)

  if (opportunity?.slug) permanentRedirect(opportunityPath(opportunity))

  const trail = opportunity ? buildOpportunityTrail(opportunity) : null
  const { eventLd, breadcrumbLd } = opportunity
    ? buildOpportunityJsonLd(opportunity)
    : { eventLd: null, breadcrumbLd: null }

  return (
    <>
      {eventLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      )}
      <OpportunityDetailView id={id} initialOpportunity={opportunity} breadcrumb={trail} />
    </>
  )
}
