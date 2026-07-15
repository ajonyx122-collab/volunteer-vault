import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/profile')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-green">Welcome back</h1>
        <p className="mt-1 text-brand-green/70">Your streak missed you.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
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
          placeholder="Password"
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
          {busy ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-brand-green/60">
        New here?{' '}
        <Link to="/signup" className="font-bold text-coral hover:underline">
          Join free
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link to="/forgot-password" className="font-semibold text-brand-green/60 hover:text-coral">
          Forgot your password?
        </Link>
      </p>
    </div>
  )
}
