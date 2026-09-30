'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabaseClient'
import { afterAuthPath, safeNext } from '../lib/authRedirect'

const inputClass = 'rounded-pill border border-card-border px-4 py-3 text-sm outline-none'

// Asks Supabase which sign-in methods are switched on (a public endpoint), once
// per page load. A button only appears once its provider is enabled in the
// Supabase dashboard — Google needs an OAuth client, phone needs Twilio — so
// nobody hits a dead-end button and turning one on needs no code change.
let providersPromise = null
function fetchProviders() {
  providersPromise ??= fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: SUPABASE_ANON_KEY },
  })
    .then((r) => r.json())
    .then((s) => ({ google: !!s.external?.google, phone: !!s.external?.phone }))
    .catch(() => ({ google: false, phone: false }))
  return providersPromise
}

// "Continue with Google" + "Use my phone number", shared by /signup and /login.
// Both create the account on first use, so there's no separate sign-up step —
// new people get sent to /welcome to fill in name / school / grade. Renders
// nothing (not even the "or use email" divider) when neither is enabled.
export default function SocialAuth({ next }) {
  const [providers, setProviders] = useState({ google: false, phone: false })
  const [mode, setMode] = useState('buttons') // buttons | phone
  const [error, setError] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  useEffect(() => {
    fetchProviders().then(setProviders)
  }, [])

  async function handleGoogle() {
    setError('')
    setGoogleBusy(true)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
        queryParams: { prompt: 'select_account' },
      },
    })
    // On success the browser is already leaving for Google.
    if (err) {
      setGoogleBusy(false)
      setError("Google sign-in isn't available right now — try email instead.")
    }
  }

  if (!providers.google && !providers.phone) return null

  if (mode === 'phone') {
    return (
      <>
        <PhoneAuth next={next} onBack={() => setMode('buttons')} />
        <OrUseEmail />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {providers.google && (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="flex items-center justify-center gap-3 rounded-pill border border-card-border bg-card px-6 py-3 text-sm font-bold text-brand-green shadow-card transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            <GoogleLogo />
            {googleBusy ? 'Opening Google...' : 'Continue with Google'}
          </button>
        )}
        {providers.phone && (
          <button
            type="button"
            onClick={() => setMode('phone')}
            className="flex items-center justify-center gap-3 rounded-pill border border-card-border bg-card px-6 py-3 text-sm font-bold text-brand-green shadow-card transition-all hover:-translate-y-0.5"
          >
            <span aria-hidden>📱</span> Continue with phone number
          </button>
        )}
        {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
        {providers.google && (
          <p className="text-center text-xs text-brand-green/50">
            School Google account blocked? Use a personal Gmail
            {providers.phone ? ', your phone,' : ''} or email below.
          </p>
        )}
      </div>
      <OrUseEmail />
    </>
  )
}

function OrUseEmail() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-brand-green/40">
      <span className="h-px flex-1 bg-card-border" /> or use email <span className="h-px flex-1 bg-card-border" />
    </div>
  )
}

// US numbers can be typed any way ("(404) 555-0123", "404.555.0123"); anything
// starting with + is taken as already international.
function toE164(raw) {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

function PhoneAuth({ next, onBack }) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [sentTo, setSentTo] = useState(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function sendCode(e) {
    e?.preventDefault()
    setError('')
    const e164 = sentTo ?? toE164(phone)
    if (!e164) {
      setError('Enter a 10-digit US number, or start with + for other countries.')
      return
    }
    setBusy(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone: e164 })
    setBusy(false)
    if (err) {
      setError(
        /provider|sms|twilio|unsupported/i.test(err.message)
          ? "Phone sign-in isn't available right now — use email instead."
          : err.message,
      )
      return
    }
    setSentTo(e164)
  }

  async function verify(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: sentTo,
      token: code.trim(),
      type: 'sms',
    })
    setBusy(false)
    if (err) {
      setError("That code didn't work — check it, or send a new one.")
      return
    }
    router.push(afterAuthPath(data.user, next))
  }

  return (
    <div className="flex flex-col gap-3">
      {!sentTo ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <input
            required
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg disabled:opacity-60"
          >
            {busy ? 'Sending...' : 'Text me a code'}
          </button>
          <p className="text-center text-xs text-brand-green/50">Standard message rates may apply.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-3">
          <p className="text-center text-sm text-brand-green/70">
            We texted a 6-digit code to <span className="font-bold">{sentTo}</span>.
          </p>
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClass} text-center tracking-[0.4em]`}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg disabled:opacity-60"
          >
            {busy ? 'Checking...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="text-xs font-bold text-coral hover:underline"
          >
            Send a new code
          </button>
        </form>
      )}
      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
      <button
        type="button"
        onClick={() => {
          setSentTo(null)
          setCode('')
          setError('')
          onBack()
        }}
        className="text-sm font-semibold text-brand-green/60 hover:text-brand-green"
      >
        ← Other ways to sign in
      </button>
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
