import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Users land here from the email link — supabase-js reads the recovery token
// from the URL automatically and logs them in, so all we do is set the new
// password.
export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Those passwords don't match.")
      return
    }
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) {
      setError(
        err.message.includes('session')
          ? 'This reset link expired — request a fresh one and use it right away.'
          : err.message,
      )
      return
    }
    navigate('/profile')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-green">Pick a new password</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          type="password"
          minLength={6}
          placeholder="New password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Type it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-pill border border-card-border px-4 py-3 text-sm outline-none"
        />
        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Save new password'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-brand-green/60">
        Link not working?{' '}
        <Link to="/forgot-password" className="font-bold text-coral hover:underline">
          Request a new one
        </Link>
      </p>
    </div>
  )
}
