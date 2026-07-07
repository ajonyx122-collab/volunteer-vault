import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignUp() {
  const [role, setRole] = useState('volunteer')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-16 w-16" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">You're in!</h1>
        <p className="text-brand-green/70">
          {role === 'volunteer'
            ? "Welcome to VolunteerVault — go find your first opportunity and start your streak."
            : "Welcome — head to your dashboard to post your first opportunity."}
        </p>
        <Link
          to={role === 'volunteer' ? '/browse' : '/dashboard'}
          className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          {role === 'volunteer' ? 'Browse opportunities' : 'Go to dashboard'}
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
          onClick={() => setRole('volunteer')}
          className={`flex-1 rounded-pill py-2 text-sm font-bold transition-colors ${
            role === 'volunteer' ? 'bg-brand-green text-cream-text' : 'text-brand-green/60'
          }`}
        >
          I'm a volunteer
        </button>
        <button
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
            <input required placeholder="Full name" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />
            <input required placeholder="School" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />
            <input
              required
              type="number"
              min="2024"
              max="2032"
              placeholder="Graduation year"
              className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
            />
          </>
        ) : (
          <>
            <input required placeholder="Organization name" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />
            <input required placeholder="City / area served" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />
          </>
        )}
        <input required type="email" placeholder="Email" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />
        <input required type="password" placeholder="Password" className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none" />

        <button
          type="submit"
          className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
        >
          Count me in
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-brand-green/50">
        By joining you agree there are no DMs between users on VolunteerVault — ever.
      </p>
    </div>
  )
}
