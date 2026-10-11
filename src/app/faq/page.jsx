'use client'

import { useState } from 'react'
import FunHero, { Squiggle } from '../../components/FunHero'

const SECTIONS = [
  {
    title: 'The basics',
    items: [
      {
        q: 'What is VolunteerVault?',
        a: "A place to find volunteer opportunities and build a real, shareable record of your service — hours, causes, badges, streaks, all of it. Think GitHub or Strava, but for showing up for your community.",
      },
      {
        q: "Who's it for?",
        a: 'Mainly high school and college students who need service hours for NHS, graduation, or college apps — but anyone who wants to volunteer and keep a real record of it is welcome, including the organizations posting opportunities.',
      },
      {
        q: 'Is it free?',
        a: 'Yes, completely free for volunteers and organizations. No catch.',
      },
      {
        q: 'Do I need an account?',
        a: "You can browse and search without one. To see a listing's full details and sign-up link, save favorites, RSVP, log hours, or post a project, you'll need a free account.",
      },
    ],
  },
  {
    title: 'Finding & joining opportunities',
    items: [
      {
        q: 'How do I find opportunities near me?',
        a: 'Head to Browse and search by interest or location, filter by category, age, remote-friendly, and more, or check the map view to see what\'s happening close by.',
      },
      {
        q: 'What does "Count me in" do?',
        a: "It RSVPs you to a listing so the org (or organizer) knows you're planning to show up, and it shows up under \"Coming up\" on your vault. It's separate from logging your hours — you can log hours even if you never RSVP'd.",
      },
      {
        q: "Some listings say \"Register on their site\" — what's that about?",
        a: "Some organizations handle sign-ups on their own website instead of through VolunteerVault. Register there to lock in your spot, then come back here afterward to log your hours — that part always happens on VolunteerVault.",
      },
    ],
  },
  {
    title: 'Logging hours',
    items: [
      {
        q: 'How do I log my hours?',
        a: 'Open the opportunity and hit "I\'m participating." Enter the date you served (or plan to) and how many hours, check the honesty pledge, and submit. It shows up on your vault as verified once that date passes.',
      },
      {
        q: 'What does "honor system" actually mean — is that really enough?',
        a: "It means we trust you to log what you actually did, the same way a paper timesheet always has. There's no QR scanner (yet) — just an honesty pledge every time you log hours, and your record is public, so it's tied to your name. We may add optional org verification down the road.",
      },
      {
        q: 'Can I log hours for something that hasn\'t happened yet?',
        a: 'Yes — log the date you plan to serve and it\'ll sit as "not yet verified" until that day passes, then it automatically counts toward your verified hours, streak, and badges.',
      },
      {
        q: 'I made a mistake logging hours — can I fix it?',
        a: "Yep. Every entry you log has Edit and Delete right next to it, any time. Nothing needs to go through the org.",
      },
      {
        q: 'Why should I bother being honest about it?',
        a: 'Because your vault is meant to be something colleges, scholarships, and employers can actually trust — and because it\'s just the right thing to do. Log what you really did, no more.',
      },
    ],
  },
  {
    title: 'Streaks, badges & leaderboards',
    items: [
      {
        q: "What's a streak, and how do I keep it going?",
        a: "It's how many weeks in a row you've logged verified hours. Log something at least once a week and it keeps climbing — miss a week and it resets. Your Browse page shows a reminder when it's at risk.",
      },
      {
        q: 'How do badges work?',
        a: "They're earned automatically from your verified hours — milestones (first shift, 10 hours, 50, and up), causes you've put real time into, streak lengths, and a few for exploring different orgs or community projects. No claiming required, they just show up on your vault.",
      },
      {
        q: 'How do leaderboards work?',
        a: "They rank real volunteers by all-time hours, this month's hours, streak length, or hours in a specific cause. You can filter to just your school if you want some friendly local competition.",
      },
    ],
  },
  {
    title: 'Student-led nonprofits & projects',
    items: [
      {
        q: 'Can I organize my own project, like a beach cleanup?',
        a: 'Absolutely — hit "Organize a project" on the Projects tab of the Student-Led page, fill in what/where/when/how many people, and it goes live right away. You manage your own signups from there, no email needed.',
      },
      {
        q: "What's the difference between a real organization and a community-organized project?",
        a: 'A verified organization is an established nonprofit or program with a checkmark badge. A community project is anyone — you — organizing something one-off or recurring. Both work the same way for RSVPs and logging hours.',
      },
      {
        q: 'I know a great place to volunteer that isn\'t listed — can I add it?',
        a: 'Yes, use "Add a place" on the Student-Led page’s Projects tab or the suggestion form on Browse. It goes live as Pending until we take a quick look.',
      },
      {
        q: 'I started a nonprofit as a student — can it get its own page?',
        a: 'Yes! High school students, college students, and recent grads who started it in school all count. Hit "List your nonprofit" on the Student-Led page, then fill in your founder profile: mission, your story, a goal with a progress bar, and a donate link. Your page goes live right away as Pending; the Donate button shows up once we verify you.',
      },
      {
        q: 'Does VolunteerVault handle donations?',
        a: 'No — the Donate button just links to the nonprofit’s own donation page (like GoFundMe or their website). The money goes straight to them; we never touch it.',
      },
    ],
  },
  {
    title: 'For organizations',
    items: [
      {
        q: "I run an organization — how do I post opportunities?",
        a: 'Sign up, then use "List an opportunity" to create your org and post listings — it\'s free and takes a few minutes.',
      },
      {
        q: 'Can I see who signed up and how many hours they\'ve logged?',
        a: 'Yes — your dashboard shows everyone who RSVP\'d to each listing and their self-reported hours, no email chains needed.',
      },
      {
        q: 'Do I need to verify volunteers\' hours myself?',
        a: "No — hours are self-reported by volunteers under the honor system, so there's nothing for you to approve. Your dashboard is read-only visibility into who's showing up and what they've logged.",
      },
    ],
  },
  {
    title: 'Privacy & safety',
    items: [
      {
        q: "I'm under 18 — is my info safe?",
        a: "We never show precise location for minors, and there's no direct messaging between users anywhere on the platform. Your public vault shows your name, school (optional), and service record — nothing else.",
      },
      {
        q: "Can I keep my school off my public vault?",
        a: 'Yes, school and graduation year are both optional — leave them blank in Edit Profile and they just won\'t show.',
      },
    ],
  },
]

// A fun icon + color for each section, keyed by its title.
const SECTION_STYLE = {
  'The basics': { icon: '👋', tone: 'bg-category-food-bg' },
  'Finding & joining opportunities': { icon: '🔎', tone: 'bg-category-music-bg' },
  'Logging hours': { icon: '✍️', tone: 'bg-category-environment-bg' },
  'Streaks, badges & leaderboards': { icon: '🔥', tone: 'bg-category-disaster-bg' },
  'Student-led nonprofits & projects': { icon: '🎓', tone: 'bg-category-animals-bg' },
  'For organizations': { icon: '🏢', tone: 'bg-category-education-bg' },
  'Privacy & safety': { icon: '🛡️', tone: 'bg-category-art-bg' },
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-card border-2 border-brand-green shadow-pop-soft transition-colors ${open ? 'bg-cream' : 'bg-card'}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="font-bold text-brand-green">{q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-green text-lg font-extrabold leading-none text-brand-green transition-transform duration-200 ${
            open ? 'rotate-45 bg-gold' : 'bg-card'
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-brand-green/80">{a}</p>}
    </div>
  )
}

export default function FAQ() {
  return (
    <div>
      <FunHero
        size="sm"
        eyebrow="💬 FAQ"
        title={
          <>
            Questions? <Squiggle>Answers.</Squiggle>
          </>
        }
        subtitle="Everything you might be wondering about finding opportunities, logging hours, and building your vault."
        badges={[
          { e: '🤔', bg: 'bg-category-food-bg' },
          { e: '💡', bg: 'bg-category-music-bg' },
          { e: '✅', bg: 'bg-category-environment-bg' },
          { e: '🙋', bg: 'bg-category-art-bg' },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {/* Jump-to chips */}
        <nav
          aria-label="FAQ sections"
          className="scrollbar-none relative -mx-4 -mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {SECTIONS.map((s) => (
            <a
              key={s.title}
              href={`#${slug(s.title)}`}
              className="shrink-0 whitespace-nowrap rounded-pill border-2 border-brand-green bg-card px-3 py-1.5 text-xs font-extrabold text-brand-green shadow-pop-soft transition-transform hover:-translate-y-0.5"
            >
              {SECTION_STYLE[s.title]?.icon} {s.title}
            </a>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-12">
          {SECTIONS.map((section) => {
            const style = SECTION_STYLE[section.title] ?? { icon: '❓', tone: 'bg-cream' }
            return (
              <section key={section.title} id={slug(section.title)} className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 -rotate-6 items-center justify-center rounded-2xl border-2 border-brand-green text-2xl shadow-pop ${style.tone}`}
                    aria-hidden
                  >
                    {style.icon}
                  </span>
                  <h2 className="font-display text-2xl font-extrabold text-brand-green">{section.title}</h2>
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="relative mt-14 overflow-hidden rounded-card border-2 border-brand-green bg-gold p-6 text-center shadow-pop sm:p-8">
          <span className="pointer-events-none absolute -left-4 -top-6 rotate-12 text-8xl opacity-20" aria-hidden>
            💬
          </span>
          <p className="font-display text-2xl font-extrabold text-gold-text">Still stuck?</p>
          <p className="mt-1 text-sm text-gold-text/80">Send us a note — a real person reads every one.</p>
          <a
            href="mailto:hello@volunteervault.org"
            className="mt-4 inline-block rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg"
          >
            hello@volunteervault.org
          </a>
        </div>
      </div>
    </div>
  )
}
