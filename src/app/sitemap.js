import { fetchOpportunitiesServer } from '../lib/api.server'
import { buildCauseDirectory, buildLocationDirectory } from '../lib/opportunityFilters'
import { opportunityPath } from '../lib/opportunityUrls'

const SITE_URL = 'https://www.volunteervault.org'

export default async function sitemap() {
  const staticRoutes = ['', '/browse', '/volunteer', '/community', '/leaderboards', '/faq', '/map', '/signup', '/login'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === '' || path === '/browse' ? 'hourly' : 'weekly',
      priority: path === '' ? 1 : path === '/browse' || path === '/volunteer' ? 0.9 : 0.5,
    }),
  )

  const opps = await fetchOpportunitiesServer().catch(() => [])

  // One entry per listing at its canonical URL (descriptive once slugged,
  // legacy /opportunities/<id> until the slug migration lands).
  const opportunityRoutes = opps.map((o) => ({
    url: `${SITE_URL}${opportunityPath(o)}`,
    lastModified: o.startsAt ? new Date(o.startsAt) : undefined,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // City/cause landing pages — the organic-search surface, so include every
  // one that currently has listings.
  const landingRoutes = [...buildCauseDirectory(opps), ...buildLocationDirectory(opps)].map((entry) => ({
    url: `${SITE_URL}/volunteer/${entry.slug}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticRoutes, ...opportunityRoutes, ...landingRoutes]
}
