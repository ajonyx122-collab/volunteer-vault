const SITE_URL = 'https://www.volunteervault.org'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/profile',
        '/dashboard',
        '/post-opportunity',
        '/admin',
        '/admin/*',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/certificate/*',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
