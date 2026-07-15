import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { createOrganization } from '../lib/api'

export default function SignUp() {
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
  const navigate = useNavigate()

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
    navigate(role === 'org' ? '/dashboard' : '/browse')
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
          to="/login"
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

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
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
        <Link to="/login" className="font-bold text-coral hover:underline">
          Log in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-brand-green/50">
        By joining you agree there are no DMs between users on VolunteerVault — ever.
      </p>
    </div>
  )
}
