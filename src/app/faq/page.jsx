'use client'

import { useState } from 'react'

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
        a: "You can browse without one, but you'll need a free account to RSVP, log hours, build a vault, or post a project.",
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
    title: 'Community projects',
    items: [
      {
        q: 'Can I organize my own project, like a beach cleanup?',
        a: 'Absolutely — hit "Organize a project" on the Community page, fill in what/where/when/how many people, and it goes live right away. You manage your own signups from there, no email needed.',
      },
      {
        q: "What's the difference between a real organization and a community-organized project?",
        a: 'A verified organization is an established nonprofit or program with a checkmark badge. A community project is anyone — you — organizing something one-off or recurring. Both work the same way for RSVPs and logging hours.',
      },
      {
        q: 'I know a great place to volunteer that isn\'t listed — can I add it?',
        a: 'Yes, use "Add a place" on the Community page or the suggestion form on Browse. It goes live as Pending until we take a quick look.',
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

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-card border-2 border-brand-green bg-card shadow-pop-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="font-bold text-brand-green">{q}</span>
        <span className={`shrink-0 text-brand-green/50 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open && <p className="px-5 pb-4 text-sm leading-relaxed text-brand-green/70">{a}</p>}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-sticker font-display text-4xl font-extrabold">Questions? Answers.</h1>
      <p className="mt-2 text-brand-green/70">
        Everything you might be wondering about finding opportunities, logging hours, and building
        your vault.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg font-extrabold text-brand-green">{section.title}</h2>
            <div className="mt-3 flex flex-col gap-2">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
