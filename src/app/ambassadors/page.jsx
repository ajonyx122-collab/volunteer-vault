import AmbassadorForm from '../../components/AmbassadorForm'

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
  },
  {
    icon: '🤝',
    title: 'Be the go-to person',
    body: 'Help classmates set up their vault and log hours, and point them to opportunities that match what they need (NHS, graduation, college apps).',
  },
  {
    icon: '📍',
    title: 'Find local spots',
    body: "Know a food bank, shelter, or cleanup near school that isn't on the site yet? Flag it so everyone at your school can find it.",
  },
  {
    icon: '💬',
    title: 'Tell us what students want',
    body: "Share quick feedback on what's working and what isn't. You'll help shape what we build next.",
  },
]

const PERKS = [
  {
    icon: '🎓',
    title: 'A real leadership role',
    body: '"School Ambassador, VolunteerVault" is something you can put on college apps and résumés — because you actually did the work.',
  },
  {
    icon: '🏆',
    title: 'Put your school on the board',
    body: 'Lead your school up the School Showdown leaderboard. More classmates logging hours = more bragging rights.',
  },
  {
    icon: '👀',
    title: 'First look at new stuff',
    body: 'Early access to new features and a direct line to the team building them.',
  },
  {
    icon: '✉️',
    title: 'A reference from us',
    body: "Do a great job and we'll happily vouch for you — for college apps, scholarships, or jobs.",
  },
]

export default function AmbassadorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <section className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-coral">School ambassadors</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-brand-green sm:text-4xl">
          Bring VolunteerVault to your school
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-green/70">
          Your classmates need service hours. You know where the good opportunities are. Be the person
          who connects the two — it takes a couple hours a month, and it's a real thing to be proud of.
        </p>
        <a
          href="#apply"
          className="mt-6 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
        >
          Count me in
        </a>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-extrabold text-brand-green">What you'd do</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DUTIES.map((d) => (
            <InfoCard key={d.title} {...d} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-brand-green">What you get</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PERKS.map((p) => (
            <InfoCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-card bg-brand-green p-6 text-cream-text shadow-card">
        <h2 className="font-display text-xl font-extrabold">The fine print (it's short)</h2>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-cream-muted">
          <li>Open to high school and college students, 13+.</li>
          <li>About 2–4 hours a month — flexible around school, sports, and everything else.</li>
          <li>It's a volunteer role (no pay), and you can step down anytime.</li>
          <li>One or more ambassadors per school — teaming up with a friend is encouraged.</li>
        </ul>
      </section>

      <section id="apply" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl font-extrabold text-brand-green">Interested? Tell us a bit about you</h2>
        <p className="mt-1 text-sm text-brand-green/60">
          Takes about 2 minutes. This isn't a commitment — we'll reach out by email to chat about next steps.
        </p>
        <AmbassadorForm />
      </section>
    </div>
  )
}

function InfoCard({ icon, title, body }) {
  return (
    <div className="rounded-card border border-card-border bg-card p-5 shadow-card">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 font-bold text-brand-green">{title}</p>
      <p className="mt-1 text-sm text-brand-green/70">{body}</p>
    </div>
  )
}
