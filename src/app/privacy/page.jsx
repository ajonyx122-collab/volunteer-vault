import Link from 'next/link'

// Where privacy / delete-my-account requests go. Must be a real inbox someone
// reads — change it here if this address isn't set up.
const CONTACT_EMAIL = 'hello@volunteervault.org'
const UPDATED = 'September 29, 2026'

export const metadata = {
  title: 'Privacy Policy',
  description: 'What VolunteerVault collects, why, and how to get your data deleted.',
  alternates: { canonical: '/privacy' },
}

const SECTIONS = [
  {
    title: 'The short version',
    body: [
      "We collect only what we need to run VolunteerVault: find opportunities, save them, and keep a record of your service hours. We don't sell your data, we don't show ads, and there are no DMs between users.",
    ],
  },
  {
    title: 'What we collect',
    list: [
      'Account info: your name, and the email address or phone number you sign up with. If you use "Continue with Google," Google shares your name, email, and profile photo with us — never your Google password.',
      'Optional profile info: your school and graduation year, if you add them.',
      'What you do on the site: opportunities you save or RSVP to, hours you log, reviews you write, and listings or community projects you post.',
      'Basic visit stats: pages viewed, device type, country, and where visitors came from (like Google or Instagram), through Vercel Analytics and Google Analytics. We use these to see how many people the site reaches.',
    ],
  },
  {
    title: "What's public",
    body: [
      'Your vault (your profile page at volunteervault.org/u/your-username) is public by design so you can share it with schools, scholarships, and employers. It shows your display name, school, hours, causes, badges, and reviews. Your email and phone number are never shown publicly.',
    ],
  },
  {
    title: 'How we use it',
    list: [
      'To run your account and show you your saved opportunities, RSVPs, and hours.',
      'To let organizations see who RSVPed to their own listings and confirm hours.',
      'To send sign-in codes and account emails. We never text you marketing messages.',
      'To count reach in totals (for example, "students from 14 schools") when we apply for grants and competitions. These numbers never name you.',
    ],
  },
  {
    title: 'Who we share it with',
    body: [
      "We don't sell or rent your information. It's stored with the services that run the site: Supabase (database and sign-in), Vercel (hosting and analytics), Google (Google sign-in and analytics), and our text-message provider (sign-in codes only).",
    ],
  },
  {
    title: 'Age',
    body: [
      "VolunteerVault is for people 13 and older. If we learn that someone under 13 has made an account, we'll delete it. Parents can contact us any time.",
    ],
  },
  {
    title: 'Your choices',
    list: [
      'Edit your name, school, and graduation year on your profile any time.',
      `Want your account and everything in it deleted, or a copy of your data? Email ${CONTACT_EMAIL} from the email (or tell us the phone number) on your account and we'll take care of it within 30 days.`,
    ],
  },
  {
    title: 'Changes',
    body: ["If we change this policy in a way that matters, we'll update the date at the top and note it on the site."],
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-brand-green">Privacy policy</h1>
      <p className="mt-1 text-sm text-brand-green/60">Last updated {UPDATED}</p>

      {SECTIONS.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="font-display text-xl font-extrabold text-brand-green">{s.title}</h2>
          {s.body?.map((p) => (
            <p key={p} className="mt-2 text-brand-green/80">
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-brand-green/80">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="mt-10 text-sm text-brand-green/60">
        Questions? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-coral hover:underline">
          {CONTACT_EMAIL}
        </a>{' '}
        or check the{' '}
        <Link href="/faq" className="font-bold text-coral hover:underline">
          FAQ
        </Link>
        .
      </p>
    </div>
  )
}
