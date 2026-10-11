'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { fetchMyOrganization } from '../lib/api'
import { useSavedIds } from '../lib/saved'

const navLinks = [
  { href: '/browse', label: 'Browse', icon: '🔎' },
  { href: '/student-led', label: 'Student-Led', icon: '🎓' },
  { href: '/leaderboards', label: 'Leaderboards', icon: '🏆' },
  { href: '/ambassadors', label: 'Ambassadors', icon: '📣' },
  { href: '/faq', label: 'FAQ', icon: '💬' },
]

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`)

export default function NavBar() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasOrg, setHasOrg] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const savedIds = useSavedIds()

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
  }, [user, pathname])

  // Close the phone menu whenever you land on a new page, and on Escape.
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  const accountHref = hasOrg ? '/dashboard' : '/profile'
  const accountLabel = hasOrg ? 'My Organization' : 'My vault'

  return (
    <header className="sticky top-0 z-50 bg-brand-green shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/brand/logo-white.png" alt="" className="h-9 w-9" />
          <span className="font-display text-lg font-extrabold text-cream-text">
            Volunteer<span className="text-gold">VAULT</span>
          </span>
        </Link>

        {/* Wide screens: everything inline */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                isActive(pathname, link.href) ? 'text-cream-text' : 'text-cream-muted hover:text-cream-text'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {savedIds.length > 0 && (
            <Link
              href="/browse?saved=1"
              title="Your saved opportunities"
              className="flex items-center gap-1 rounded-pill bg-brand-green-light/50 px-3 py-1.5 text-sm font-bold text-cream-text transition-colors hover:bg-brand-green-light"
            >
              ❤️ <span>{savedIds.length}</span>
            </Link>
          )}

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                {profile?.is_admin && (
                  <Link href="/admin" className="text-sm font-semibold text-cream-muted hover:text-cream-text">
                    Admin
                  </Link>
                )}
                <Link href={accountHref} className="text-sm font-semibold text-cream-muted hover:text-cream-text">
                  {accountLabel}
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
                <Link href="/login" className="text-sm font-semibold text-cream-muted hover:text-cream-text">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-pill bg-gold px-4 py-2 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
                >
                  Join free
                </Link>
              </>
            )}
          </div>

          {/* Phones + tablets: the ☰ button */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-pill transition-colors hover:bg-brand-green-light lg:hidden"
          >
            <span className={`h-0.5 w-6 rounded-full bg-cream-text transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 rounded-full bg-cream-text transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 rounded-full bg-cream-text transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          {/* Tap outside to close */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-[60px] z-40 cursor-default bg-black/30 lg:hidden"
          />
          <nav
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-brand-green-light bg-brand-green px-4 pb-5 pt-2 shadow-soft lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-card px-4 py-3 text-base font-bold transition-colors ${
                      isActive(pathname, link.href)
                        ? 'bg-brand-green-light text-cream-text'
                        : 'text-cream-muted hover:bg-brand-green-light/60 hover:text-cream-text'
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t border-brand-green-light pt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={accountHref}
                    className="flex items-center gap-3 rounded-card px-4 py-3 text-base font-bold text-cream-text hover:bg-brand-green-light/60"
                  >
                    <span className="text-xl" aria-hidden>
                      {hasOrg ? '🏢' : '🔐'}
                    </span>
                    {accountLabel}
                  </Link>
                  {profile?.is_admin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-card px-4 py-3 text-base font-bold text-cream-muted hover:bg-brand-green-light/60 hover:text-cream-text"
                    >
                      <span className="text-xl" aria-hidden>
                        🛠️
                      </span>
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-1 rounded-pill border border-cream-muted px-4 py-3 text-sm font-bold text-cream-text hover:bg-brand-green-light"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-pill border border-cream-muted px-4 py-3 text-center text-sm font-bold text-cream-text hover:bg-brand-green-light"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-pill bg-gold px-4 py-3 text-center text-sm font-bold text-gold-text shadow-pop"
                  >
                    Join free
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
