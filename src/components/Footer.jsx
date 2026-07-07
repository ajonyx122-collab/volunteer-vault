import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-green">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <img src="/brand/logo-white.png" alt="" className="h-8 w-8" />
            <span className="font-display text-base font-extrabold text-cream-text">
              Volunteer<span className="text-gold">VAULT</span>
            </span>
          </div>
          <p className="max-w-md text-sm text-cream-muted">
            Your people are already out here. Come find them — and build a service record
            people can actually trust.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream-muted">
          <Link to="/browse" className="hover:text-cream-text">Browse</Link>
          <Link to="/signup" className="hover:text-cream-text">For organizations</Link>
          <Link to="/profile" className="hover:text-cream-text">My vault</Link>
          <span>© {new Date().getFullYear()} VolunteerVault</span>
        </div>
      </div>
    </footer>
  )
}
