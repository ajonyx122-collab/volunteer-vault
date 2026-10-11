// Shared frame for the sign-in-ish pages (log in, sign up, password reset,
// welcome): a fun green panel on the left (a slim band on phones) and the
// form in a sticker card on the right.
const DEFAULT_PERKS = [
  { icon: '🔎', text: 'Find real opportunities near you — or online' },
  { icon: '✍️', text: 'Log your hours in seconds' },
  { icon: '🔐', text: 'One shareable vault colleges can trust' },
]

export default function AuthShell({ children, headline = 'Unlock your community.', perks = DEFAULT_PERKS }) {
  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative overflow-hidden bg-gradient-to-br from-[#1B6E42] via-brand-green to-[#14432b] px-6 py-8 text-cream-text lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="animate-blob absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-coral/30 blur-3xl" style={{ animationDelay: '4s' }} />
          {[
            { e: '🌱', pos: 'right-6 top-6 lg:right-12 lg:top-14', bg: 'bg-category-environment-bg', t: '8deg', d: '0s' },
            { e: '🐾', pos: 'hidden lg:flex right-24 bottom-24', bg: 'bg-category-animals-bg', t: '-6deg', d: '1s' },
            { e: '📚', pos: 'hidden lg:flex left-12 bottom-12', bg: 'bg-category-education-bg', t: '6deg', d: '2s' },
          ].map((b) => (
            <span
              key={b.e}
              className={`animate-floaty absolute flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-pop lg:h-14 lg:w-14 lg:text-2xl ${b.bg} ${b.pos}`}
              style={{ '--tilt': b.t, animationDelay: b.d }}
            >
              {b.e}
            </span>
          ))}
        </div>

        <div className="relative mx-auto max-w-md lg:mx-0 lg:mt-10">
          <span className="font-display text-lg font-extrabold">
            Volunteer<span className="text-gold">VAULT</span>
          </span>
          <p className="mt-2 font-display text-3xl font-extrabold leading-tight lg:mt-6 lg:text-5xl">{headline}</p>
          <ul className="mt-6 hidden flex-col gap-3 lg:flex">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-cream-muted">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-text/10 text-xl ring-1 ring-cream-text/20">
                  {p.icon}
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="bg-dots flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:py-16">
        <div className="w-full max-w-md rounded-card border-2 border-brand-green bg-card p-6 shadow-pop-soft sm:p-8">{children}</div>
      </div>
    </div>
  )
}
