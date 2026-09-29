'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { createOrganization } from '../../lib/api'
import { safeNext } from '../../lib/authRedirect'
import SocialAuth from '../../components/SocialAuth'

// Why they were sent here (?why=...), so the page can say what they're unlocking.
const WHY_COPY = {
  save: 'Make a free account to save opportunities — your list follows you to any device.',
  details: 'Make a free account to see full details and how to sign up.',
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp />
    </Suspense>
  )
}

function SignUp() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const why = WHY_COPY[searchParams.get('why')]
  const [ageOk, setAgeOk] = useState(false)
  const [role, setRole] = useState('volunteer')
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgLocation, setOrgLocation] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const displayName = role === 'volunteer' ? fullName : orgName
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          // Filled in the details on this form, so skip the /welcome step.
          onboarded: true,
          school: role === 'volunteer' && school.trim() ? school.trim() : null,
          grad_year: role === 'volunteer' && gradYear ? gradYear : null,
        },
      },
    })

    if (err) {
      setBusy(false)
      setError(err.message)
      return
    }

    // If email confirmation is on, there's no session yet — the org row (and
    // everything else) waits until they confirm and log in.
    if (!data.session) {
      setBusy(false)
      setNeedsConfirm(true)
      return
    }

    if (role === 'org') {
      try {
        await createOrganization(data.session.user.id, { name: orgName, location: orgLocation })
      } catch {
        // org creation can be redone from the dashboard, don't block signup
      }
    }

    setBusy(false)
    router.push(role === 'org' ? '/dashboard' : safeNext(next))
  }

  if (needsConfirm) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-16 w-16" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Check your email 📬</h1>
        <p className="text-brand-green/70">
          We sent a confirmation link to <span className="font-bold">{email}</span>. Click it, then
          log in and you're off to the races.
        </p>
        <Link
          href="/login"
          className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
        >
          Go to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-green">Join free</h1>
        <p className="mt-1 text-brand-green/70">Your people are already out here.</p>
        {why && (
          <p className="mt-4 rounded-card border border-gold bg-category-food-bg px-4 py-3 text-sm font-semibold text-gold-text">
            🔒 {why}
          </p>
        )}
      </div>

      <div className="mt-6 flex rounded-pill border border-card-border bg-card p-1 shadow-card">
        <button
          type="button"
          onClick={() => setRole('volunteer')}
          className={`flex-1 rounded-pill py-2 text-sm font-bold transition-colors ${
            role === 'volunteer' ? 'bg-brand-green text-cream-text' : 'text-brand-green/60'
          }`}
        >
          I'm a volunteer
        </button>
        <button
          type="button"
          onClick={() => setRole('org')}
          className={`flex-1 rounded-pill py-2 text-sm font-bold transition-colors ${
            role === 'org' ? 'bg-brand-green text-cream-text' : 'text-brand-green/60'
          }`}
        >
          I'm an organization
        </button>
      </div>

      {role === 'volunteer' && (
        <div className="mt-6">
          <SocialAuth next={next} />
          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-brand-green/40">
            <span className="h-px flex-1 bg-card-border" /> or use email <span className="h-px flex-1 bg-card-border" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${role === 'volunteer' ? '' : 'mt-6 '}flex flex-col gap-3`}>
        {role === 'volunteer' ? (
          <>
            <input
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
            <input
              placeholder="School or organization (optional — add anytime)"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
            <input
              type="number"
              min="2024"
              max="2032"
              placeholder="Graduation year (optional)"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
          </>
        ) : (
          <>
            <input
              required
              placeholder="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
            <input
              required
              placeholder="City / area served"
              value={orgLocation}
              onChange={(e) => setOrgLocation(e.target.value)}
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
          </>
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
        />

        <label className="flex items-start gap-2 px-2 text-sm text-brand-green/80">
          <input type="checkbox" required checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} className="mt-1" />
          <span>
            {role === 'volunteer' ? "I'm 13 or older and I've read the " : "I've read the "}
            <Link href="/privacy" target="_blank" className="font-bold text-coral hover:underline">
              privacy policy
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          {busy ? 'Creating account...' : 'Count me in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-brand-green/60">
        Already have an account?{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-bold text-coral hover:underline">
          Log in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-brand-green/50">
        By joining you agree there are no DMs between users on VolunteerVault — ever.
      </p>
    </div>
  )
}
