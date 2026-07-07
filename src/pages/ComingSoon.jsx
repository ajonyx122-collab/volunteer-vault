import { Link } from 'react-router-dom'

export default function ComingSoon({ title, blurb }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
      <h1 className="font-display text-2xl font-extrabold text-brand-green">{title}</h1>
      <p className="text-brand-green/70">{blurb}</p>
      <Link
        to="/browse"
        className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
      >
        Browse opportunities instead
      </Link>
    </div>
  )
}
