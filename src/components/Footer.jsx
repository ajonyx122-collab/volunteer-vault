import Link from 'next/link'
import WaveDivider from './WaveDivider'

const COLUMNS = [
  {
    title: 'Find stuff',
    links: [
      { href: '/browse', label: '🔎 Browse everything' },
      { href: '/volunteer', label: '📍 By cause & city' },
      { href: '/map', label: '🗺️ Map' },
      { href: '/browse?remote=1', label: '🌐 Remote roles' },
    ],
  },
  {
    title: 'Get involved',
    links: [
      { href: '/student-led', label: '🎓 Student-led nonprofits' },
      { href: '/student-led?tab=projects', label: '🌱 Community projects' },
      { href: '/ambassadors', label: '📣 Become an ambassador' },
      { href: '/leaderboards', label: '🏆 Leaderboards' },
    ],
  },
  {
    title: 'You',
    links: [
      { href: '/profile', label: '🔐 My vault' },
      { href: '/signup', label: '🏢 For organizations' },
      { href: '/faq', label: '💬 FAQ' },
      { href: '/privacy', label: '🛡️ Privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto">
      <WaveDivider className="text-brand-green" />
      <div className="bg-dots-light relative overflow-hidden bg-brand-green">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10">
          <div className="grid gap-10 md:grid-cols-[1.3fr_2fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <img src="/brand/logo-white.png" alt="" className="h-10 w-10" />
                <span className="font-display text-xl font-extrabold text-cream-text">
                  Volunteer<span className="text-gold">VAULT</span>
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm text-cream-muted">
                Your people are already out here. Come find them — and build a service record people
                can actually trust.
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-block rounded-pill bg-gold px-5 py-2.5 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg"
              >
                Join free — it takes a minute
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gold">{col.title}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm text-cream-muted transition-colors hover:text-cream-text">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-cream-text/15 pt-5 text-xs text-cream-muted sm:flex-row">
            <span>© {new Date().getFullYear()} VolunteerVault · made by students, for students 💚</span>
            <span>Free for volunteers and organizations. Always.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
