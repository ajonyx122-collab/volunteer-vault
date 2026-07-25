import { notFound, permanentRedirect } from 'next/navigation'
import { fetchOpportunityBySlugServer } from '../../../../../lib/api.server'
import { opportunityPath } from '../../../../../lib/opportunityUrls'
import {
  buildOpportunityMetadata,
  buildOpportunityTrail,
  buildOpportunityJsonLd,
} from '../../../../../lib/opportunityMeta'
import OpportunityDetailView from '../../../../../components/OpportunityDetailView'

// Descriptive opportunity URL: /volunteer/<city>/<org>/<slug>. The first two
// segments are named [slug]/[org] here so this nests cleanly under the existing
// /volunteer/[slug] landing route (Next forbids differently-named dynamic
// segments at the same position). Lookup is by the [opp] slug alone.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { opp } = await params
  const opportunity = await fetchOpportunityBySlugServer(opp).catch(() => null)
  if (!opportunity) return { title: 'Opportunity not found' }
  return buildOpportunityMetadata(opportunity)
}

export default async function OpportunityDetailPage({ params }) {
  const { slug: city, org, opp } = await params
  const opportunity = await fetchOpportunityBySlugServer(opp).catch(() => null)
  if (!opportunity) notFound()

  // Canonicalize: a right-slug/wrong-city-or-org link 308s to the true path.
  const canonical = opportunityPath(opportunity)
  if (canonical !== `/volunteer/${city}/${org}/${opp}`) permanentRedirect(canonical)

  const trail = buildOpportunityTrail(opportunity)
  const { eventLd, breadcrumbLd } = buildOpportunityJsonLd(opportunity)

  return (
    <>
      {eventLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      )}
      <OpportunityDetailView id={opportunity.id} initialOpportunity={opportunity} breadcrumb={trail} />
    </>
  )
}
