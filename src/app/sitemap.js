import { fetchOpportunityIdsServer } from '../lib/api.server'

const SITE_URL = 'https://volunteervault.org'

export default async function sitemap() {
  const staticRoutes = ['', '/browse', '/community', '/leaderboards', '/faq', '/map', '/signup', '/login'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: path === '' || path === '/browse' ? 'hourly' : 'weekly',
      priority: path === '' ? 1 : path === '/browse' ? 0.9 : 0.5,
    }),
  )

  const opportunities = await fetchOpportunityIdsServer().catch(() => [])
  const opportunityRoutes = opportunities.map((o) => ({
    url: `${SITE_URL}/opportunities/${o.id}`,
    lastModified: o.starts_at ? new Date(o.starts_at) : undefined,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...opportunityRoutes]
}
