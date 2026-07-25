import { Analytics } from '@vercel/analytics/react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { AuthProvider } from '../lib/AuthContext'
import './globals.css'

export const metadata = {
  metadataBase: new URL('https://www.volunteervault.org'),
  title: {
    default: 'VolunteerVault — Volunteer Opportunities for High School & College Students',
    template: '%s | VolunteerVault',
  },
  description:
    'Find real volunteer opportunities near you and build a verified record of your service — hours colleges, scholarships, and employers can trust. Free for students and organizations.',
  openGraph: {
    type: 'website',
    siteName: 'VolunteerVault',
    title: 'VolunteerVault — Volunteer Opportunities for High School & College Students',
    description:
      'Find real volunteer opportunities near you and build a verified record of your service — hours colleges, scholarships, and employers can trust.',
    images: ['/brand/logo-full.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VolunteerVault — Volunteer Opportunities for High School & College Students',
    description:
      'Find real volunteer opportunities near you and build a verified record of your service.',
    images: ['/brand/logo-full.png'],
  },
  icons: {
    icon: '/brand/logo-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-cream">
        <AuthProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
