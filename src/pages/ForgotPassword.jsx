import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Check your email 📬</h1>
        <p className="text-brand-green/70">
          If an account exists for <span className="font-bold">{email}</span>, we sent a link to reset
          your password. It can take a minute — check spam too.
        </p>
        <Link to="/login" className="font-bold text-coral hover:underline">
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-green">Reset password</h1>
        <p className="mt-1 text-brand-green/70">We'll email you a link to pick a new one.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder="Your account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
        />
        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          {busy ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-brand-green/60">
        Remembered it?{' '}
        <Link to="/login" className="font-bold text-coral hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
