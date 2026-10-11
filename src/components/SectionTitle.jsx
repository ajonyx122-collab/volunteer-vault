import Link from 'next/link'

// The site-wide section heading: small coral "kicker" line + chunky sticker
// title (+ optional blurb and a "See all →" style link on the right).
// `tone="dark"` for use on green backgrounds.
export default function SectionTitle({ kicker, title, blurb, action, center = false, tone = 'light', as: Tag = 'h2' }) {
  const dark = tone === 'dark'
  return (
    <div className={`flex flex-wrap items-end gap-3 ${center ? 'justify-center text-center' : 'justify-between'}`}>
      <div className={center ? 'mx-auto max-w-2xl' : 'min-w-0'}>
        {kicker && (
          <p className={`text-xs font-extrabold uppercase tracking-widest ${dark ? 'text-gold' : 'text-coral'}`}>{kicker}</p>
        )}
        <Tag
          className={`mt-1 font-display text-3xl font-extrabold leading-tight sm:text-4xl ${
            dark ? 'text-cream-text' : 'text-sticker'
          }`}
        >
          {title}
        </Tag>
        {blurb && <p className={`mt-2 text-sm sm:text-base ${dark ? 'text-cream-muted' : 'text-brand-green/60'}`}>{blurb}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`shrink-0 rounded-pill border-2 px-4 py-1.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
            dark
              ? 'border-cream-text/40 text-cream-text hover:bg-cream-text/10'
              : 'border-brand-green bg-card text-brand-green shadow-pop-soft hover:shadow-pop'
          }`}
        >
          {action.label} →
        </Link>
      )}
    </div>
  )
}
