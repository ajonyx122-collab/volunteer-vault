import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/browse', label: 'Browse' },
  { to: '/community', label: 'Community' },
  { to: '/leaderboards', label: 'Leaderboards' },
]

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-brand-green shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/logo-white.png" alt="" className="h-9 w-9" />
          <span className="font-display text-lg font-extrabold text-cream-text">
            Volunteer<span className="text-gold">VAULT</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-cream-text' : 'text-cream-muted hover:text-cream-text'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="hidden text-sm font-semibold text-cream-muted hover:text-cream-text sm:block"
          >
            My vault
          </Link>
          <Link
            to="/signup"
            className="rounded-pill bg-gold px-4 py-2 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
          >
            Join free
          </Link>
        </div>
      </div>
    </header>
  )
}
