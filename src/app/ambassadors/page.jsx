import AmbassadorForm from '../../components/AmbassadorForm'
import FunHero, { Squiggle } from '../../components/FunHero'
import Reveal from '../../components/Reveal'

export const metadata = {
  title: 'Become a School Ambassador',
  description:
    'Bring VolunteerVault to your school. Help classmates find service hours, rep your school in the School Showdown, and earn leadership experience for college apps.',
  alternates: { canonical: '/ambassadors' },
}

const DUTIES = [
  {
    icon: '📣',
    title: 'Spread the word',
    body: 'Tell your friends, clubs, and classes about VolunteerVault — a quick announcement, a post, a flyer on the club board. You pick what fits your school.',
    tone: 'bg-category-food-bg',
  },
  {
    icon: '🤝',
    title: 'Be the go-to person',
    body: 'Help classmates set up their vault and log hours, and point them to opportunities that match what they need (NHS, graduation, college apps).',
    tone: 'bg-category-music-bg',
  },
  {
    icon: '📍',
    title: 'Find local spots',
    body: "Know a food bank, shelter, or cleanup near school that isn't on the site yet? Flag it so everyone at your school can find it.",
    tone: 'bg-category-environment-bg',
  },
  {
    icon: '💬',
    title: 'Tell us what students want',
    body: "Share quick feedback on what's working and what isn't. You'll help shape what we build next.",
    tone: 'bg-category-art-bg',
  },
]

const PERKS = [
  {
    icon: '🎓',
    title: 'A real leadership role',
    body: '"School Ambassador, VolunteerVault" goes on college apps and résumés — because you actually did the work.',
    tone: 'bg-category-animals-bg',
  },
  {
    icon: '🏆',
    title: 'Put your school on the board',
    body: 'Lead your school up the School Showdown leaderboard. More classmates logging hours = more bragging rights.',
    tone: 'bg-category-food-bg',
  },
  {
    icon: '👀',
    title: 'First look at new stuff',
    body: 'Early access to new features and a direct line to the team building them.',
    tone: 'bg-category-music-bg',
  },
  {
    icon: '✉️',
    title: 'A reference from us',
    body: "Do a great job and we'll happily vouch for you — for college apps, scholarships, or jobs.",
    tone: 'bg-category-medicine-bg',
  },
]

const STEPS = [
  { n: 1, icon: '🙋', title: 'Raise your hand', body: 'Fill out the 2-minute form below.' },
  { n: 2, icon: '📬', title: 'Quick chat', body: "We'll email you to say hi and answer questions." },
  { n: 3, icon: '🚀', title: 'Launch at your school', body: 'Get your starter ideas and go rep your school.' },
]

const QUICK_FACTS = [
  { icon: '⏱️', text: '2–4 hrs / month' },
  { icon: '🎒', text: 'High school + college' },
  { icon: '👯', text: 'Team up with a friend' },
]

export default function AmbassadorsPage() {
  return (
    <div>
      <FunHero
        eyebrow="📣 School Ambassadors"
        title={
          <>
            Bring VolunteerVault to <Squiggle>your school</Squiggle>
          </>
        }
        subtitle="Your classmates need service hours. You know where the good opportunities are. Be the person who connects the two."
        badges={[
          { e: '📣', bg: 'bg-category-food-bg' },
          { e: '🏫', bg: 'bg-category-music-bg' },
          { e: '🏆', bg: 'bg-category-animals-bg' },
          { e: '🎓', bg: 'bg-category-environment-bg' },
          { e: '✨', bg: 'bg-category-art-bg' },
          { e: '🤝', bg: 'bg-category-community-bg' },
        ]}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#apply"
            className="w-full rounded-pill bg-gold px-8 py-3.5 text-base font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none sm:w-auto"
          >
            Count me in 🙌
          </a>
          <a
            href="#what"
            className="w-full rounded-pill px-6 py-3 text-sm font-bold text-cream-text ring-2 ring-cream-text/40 transition-colors hover:bg-cream-text/10 sm:w-auto"
          >
            What would I do? ↓
          </a>
        </div>
      </FunHero>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Quick facts: sticker pills overlapping the hero edge */}
        <div className="relative -mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
          {QUICK_FACTS.map((f, i) => (
            <span
              key={f.text}
              className="rounded-pill border-2 border-brand-green bg-card px-4 py-2 text-sm font-bold text-brand-green shadow-pop-soft"
              style={{ transform: `rotate(${[-2, 1.5, -1][i]}deg)` }}
            >
              {f.icon} {f.text}
            </span>
          ))}
        </div>

        <section id="what" className="scroll-mt-24 pt-14">
          <Reveal>
            <SectionTitle kicker="The job" title="What you'd do" />
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DUTIES.map((d, i) => (
              <Reveal key={d.title} delay={i * 80}>
                <FunCard {...d} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-14">
          <Reveal>
            <SectionTitle kicker="The good stuff" title="What you get" />
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <FunCard {...p} unlocked />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="pt-14">
          <Reveal>
            <SectionTitle kicker="Easy start" title="How it works" />
          </Reveal>
          <ol className="relative mt-6 grid gap-4 sm:grid-cols-3">
            {/* dashed path connecting the steps on desktop */}
            <div className="absolute left-[16%] right-[16%] top-8 hidden border-t-4 border-dashed border-gold/60 sm:block" aria-hidden />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} as="li" className="relative flex flex-col items-center text-center">
                <span className="hover-wiggle relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-cream bg-gold text-3xl shadow-pop">
                  {s.icon}
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-xs font-extrabold text-cream-text">
                    {s.n}
                  </span>
                </span>
                <p className="mt-3 font-display text-lg font-extrabold text-brand-green">{s.title}</p>
                <p className="mt-1 max-w-[16rem] text-sm text-brand-green/70">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <Reveal className="pt-14">
          <section className="relative overflow-hidden rounded-card bg-brand-green p-6 text-cream-text shadow-pop-soft sm:p-8">
            <span className="pointer-events-none absolute -right-4 -top-6 text-8xl opacity-10" aria-hidden>
              📋
            </span>
            <h2 className="font-display text-2xl font-extrabold">The fine print (it's short)</h2>
            <ul className="mt-4 grid gap-3 text-sm text-cream-muted sm:grid-cols-2">
              <li>🎒 Open to high school and college students, 13+.</li>
              <li>⏱️ About 2–4 hours a month, flexible around school and everything else.</li>
              <li>💚 It's a volunteer role (no pay), and you can step down anytime.</li>
              <li>👯 More than one ambassador per school is great — bring a friend.</li>
            </ul>
          </section>
        </Reveal>

        <section id="apply" className="scroll-mt-24 pb-16 pt-14">
          <SectionTitle kicker="Sound like you?" title="Raise your hand 🙋" />
          <p className="mt-2 text-sm text-brand-green/60">
            Takes about 2 minutes. Not a commitment — we'll reach out by email to chat about next steps.
          </p>
          <AmbassadorForm />
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ kicker, title }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral">{kicker}</p>
      <h2 className="text-sticker mt-1 font-display text-3xl font-extrabold sm:text-4xl">{title}</h2>
    </div>
  )
}

function FunCard({ icon, title, body, tone, unlocked }) {
  return (
    <div className="group relative flex h-full gap-4 rounded-card border-2 border-brand-green bg-card p-4 shadow-pop-soft transition-transform hover:-translate-y-1 hover:rotate-[-0.6deg] sm:block sm:p-5">
      {unlocked && (
        <span className="absolute -top-3 right-4 rotate-3 rounded-pill bg-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-gold-text shadow-pop">
          🔓 Unlocked
        </span>
      )}
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl transition-transform group-hover:rotate-6 group-hover:scale-110 sm:h-14 sm:w-14 sm:text-3xl ${tone}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-extrabold leading-tight text-brand-green sm:mt-3">{title}</p>
        <p className="mt-1 text-sm text-brand-green/70">{body}</p>
      </div>
    </div>
  )
}
