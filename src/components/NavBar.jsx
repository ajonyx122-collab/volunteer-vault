import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { fetchMyOrganization } from '../lib/api'

const navLinks = [
  { to: '/browse', label: 'Browse' },
  { to: '/community', label: 'Community' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/faq', label: 'FAQ' },
]

export default function NavBar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [hasOrg, setHasOrg] = useState(false)

  useEffect(() => {
    if (!user) {
      setHasOrg(false)
      return
    }
    // Re-checked on every route change (not just login) so the nav flips to
    // "My Organization" right after someone creates one on /dashboard,
    // without needing a full page reload.
    fetchMyOrganization(user.id)
      .then((org) => setHasOrg(!!org))
      .catch(() => setHasOrg(false))
  }, [user, location.pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-green shadow-soft">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
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

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              {profile?.is_admin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-cream-muted hover:text-cream-text"
                >
                  Admin
                </Link>
              )}
              <Link
                to={hasOrg ? '/dashboard' : '/profile'}
                className="text-sm font-semibold text-cream-muted hover:text-cream-text"
              >
                {hasOrg ? 'My Organization' : 'My vault'}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-pill border border-cream-muted px-4 py-2 text-sm font-bold text-cream-text transition-colors hover:bg-brand-green-light"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-cream-muted hover:text-cream-text"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-pill bg-gold px-4 py-2 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
