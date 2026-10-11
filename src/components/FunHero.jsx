// The big, colorful page header used on Ambassadors + Student-Led — same
// green gradient, drifting blobs, and floating sticker badges as the home
// hero, so the newer pages feel like part of the same family.
//
// `title` can include a <Squiggle>...</Squiggle> for the hand-drawn underline.
export default function FunHero({ eyebrow, title, subtitle, badges = [], children, size = 'lg' }) {
  const sm = size === 'sm'
  // Split badges into a left and right column, mirrored like the home hero.
  const left = badges.filter((_, i) => i % 2 === 0)
  const right = badges.filter((_, i) => i % 2 === 1)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1B6E42] via-brand-green to-[#14432b]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
        <div className="animate-blob absolute -right-10 top-6 h-80 w-80 rounded-full bg-coral/30 blur-3xl" style={{ animationDelay: '3s' }} />
        <div className="animate-blob absolute -bottom-16 left-1/4 h-72 w-72 rounded-full bg-category-music-text/25 blur-3xl" style={{ animationDelay: '6s' }} />
      </div>

      {/* Floating sticker badges: tucked into the corners on phones, full columns on desktop */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        {left.map((b, i) => (
          <Badge key={`l${i}`} {...b} side="left" index={i} />
        ))}
        {right.map((b, i) => (
          <Badge key={`r${i}`} {...b} side="right" index={i} />
        ))}
      </div>

      <div
        className={`relative mx-auto max-w-4xl px-4 text-center sm:px-6 ${
          sm ? 'pb-12 pt-9 sm:pb-14 sm:pt-12' : 'pb-14 pt-12 sm:pb-20 sm:pt-16'
        }`}
      >
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-cream-text/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-cream-text ring-1 ring-cream-text/20 sm:text-sm">
            {eyebrow}
          </span>
        )}
        <h1
          className={`font-display font-extrabold leading-tight text-cream-text ${
            sm ? 'mt-4 text-3xl sm:text-5xl' : 'mt-5 text-4xl sm:text-6xl'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={`mx-auto mt-3 max-w-2xl text-cream-muted ${sm ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>{subtitle}</p>
        )}
        {children && <div className={sm ? 'mt-6' : 'mt-8'}>{children}</div>}
      </div>
    </section>
  )
}

const TOPS = ['top-[14%]', 'top-[46%]', 'top-[76%]']

function Badge({ e, bg, side, index }) {
  const tilt = side === 'left' ? (index % 2 ? '6deg' : '-8deg') : index % 2 ? '-6deg' : '8deg'
  // On phones only the first badge per side shows, small, up in the corner.
  const phone = index === 0 ? 'flex' : 'hidden lg:flex'
  const pos = side === 'left' ? 'left-3 lg:left-[5%]' : 'right-3 lg:right-[5%]'
  const top = index === 0 ? 'top-4 lg:top-[14%]' : TOPS[index] ?? TOPS[2]
  return (
    <span
      className={`animate-floaty absolute ${phone} ${pos} ${top} h-10 w-10 items-center justify-center rounded-full text-lg shadow-pop lg:h-14 lg:w-14 lg:text-2xl ${bg}`}
      style={{ '--tilt': tilt, animationDelay: `${index * 0.8 + (side === 'right' ? 0.4 : 0)}s` }}
    >
      {e}
    </span>
  )
}

// Hand-drawn orange underline that draws itself in (same as "Unlock" on home).
export function Squiggle({ children }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="squiggle-draw absolute -bottom-2 left-0 w-full sm:-bottom-3"
        height="16"
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M3 11 Q 27 3 52 9 T 100 9 T 148 9 T 197 8"
          stroke="#E8983E"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength="1"
        />
      </svg>
    </span>
  )
}
