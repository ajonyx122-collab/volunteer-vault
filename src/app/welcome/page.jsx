'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import { safeNext } from '../../lib/authRedirect'

const inputClass = 'rounded-pill border border-card-border px-4 py-3 text-sm outline-none'

// One-time "finish your profile" step for people who joined with Google or a
// phone number (they skipped the signup form). Email sign-ups never see it.
function Welcome() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [ageOk, setAgeOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/signup')
  }, [loading, user, router])

  useEffect(() => {
    if (!profile) return
    // Phone sign-ups start out named "Volunteer" — make them type a real name.
    setName((n) => n || (profile.display_name === 'Volunteer' ? '' : profile.display_name))
    setSchool((s) => s || profile.school || '')
    setGradYear((g) => g || (profile.grad_year ? String(profile.grad_year) : ''))
  }, [profile])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim(),
        school: school.trim() || null,
        grad_year: gradYear ? Number(gradYear) : null,
      })
      .eq('id', user.id)
    if (err) {
      setBusy(false)
      setError("Couldn't save that — try again.")
      return
    }
    await supabase.auth.updateUser({ data: { onboarded: true } })
    await refreshProfile()
    router.replace(next)
  }

  if (loading || !user) return <p className="py-24 text-center text-brand-green/70">Loading...</p>

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-green">You're in! 🎉</h1>
        <p className="mt-1 text-brand-green/70">Two seconds to set up your vault.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input
          placeholder="School (optional — add anytime)"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          min="2024"
          max="2035"
          placeholder="Graduation year (optional)"
          value={gradYear}
          onChange={(e) => setGradYear(e.target.value)}
          className={inputClass}
        />
        <label className="flex items-start gap-2 px-2 text-sm text-brand-green/80">
          <input type="checkbox" required checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} className="mt-1" />
          <span>
            I'm 13 or older and I've read the{' '}
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
          className="mt-2 rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg disabled:opacity-60"
        >
          {busy ? 'Saving...' : "Let's go"}
        </button>
      </form>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <Welcome />
    </Suspense>
  )
}
