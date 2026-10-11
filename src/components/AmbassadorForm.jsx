'use client'

import { useEffect, useState } from 'react'
import { US_STATES } from '../data/mockData'
import { submitAmbassadorApplication } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const inputClass = 'w-full rounded-pill border border-card-border bg-white px-4 py-2.5 text-sm outline-none'
const labelClass = 'mb-1 block text-xs font-bold text-brand-green/70'

const HOURS_OPTIONS = ['1–2 hours/month', '3–5 hours/month', '6+ hours/month', 'Not sure yet']

const empty = {
  fullName: '',
  email: '',
  phone: '',
  school: '',
  schoolCity: '',
  schoolState: '',
  gradYear: '',
  clubs: '',
  why: '',
  hoursPerMonth: '',
  socialHandle: '',
  heardFrom: '',
}

export default function AmbassadorForm() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // Prefill what we already know for logged-in students (only empty fields,
  // so we never overwrite something they've typed).
  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || profile?.display_name || '',
      email: prev.email || user.email || '',
      school: prev.school || profile?.school || '',
      gradYear: prev.gradYear || (profile?.grad_year ? String(profile.grad_year) : ''),
    }))
  }, [user, profile])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await submitAmbassadorApplication({ ...form, userId: user?.id })
      setSent(true)
      setForm(empty)
    } catch {
      setError("Couldn't send that — check your connection and try again.")
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-card border border-card-border bg-card p-6 text-center shadow-card">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 font-display text-xl font-extrabold text-brand-green">You're on our list!</p>
        <p className="mt-1 text-sm text-brand-green/70">
          Thanks for raising your hand. We'll email you soon to talk about next steps — keep an eye on
          your inbox (and spam folder, just in case).
        </p>
      </div>
    )
  }

  const thisYear = new Date().getFullYear()
  const gradYears = Array.from({ length: 9 }, (_, i) => thisYear + i)

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 rounded-card border-2 border-brand-green bg-card p-5 shadow-pop-soft sm:p-6"
    >
      <BadgePreview name={form.fullName} school={form.school} gradYear={form.gradYear} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name *">
          <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email (where we'll reach you) *">
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="School *">
          <input
            required
            placeholder="e.g. Lincoln High School"
            value={form.school}
            onChange={(e) => update('school', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Graduation year">
          <select value={form.gradYear} onChange={(e) => update('gradYear', e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            {gradYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Field label="School city *">
          <input required value={form.schoolCity} onChange={(e) => update('schoolCity', e.target.value)} className={inputClass} />
        </Field>
        <Field label="State *">
          <select required value={form.schoolState} onChange={(e) => update('schoolState', e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Clubs or groups you're in (NHS, Key Club, student council, sports...)">
        <input value={form.clubs} onChange={(e) => update('clubs', e.target.value)} className={inputClass} />
      </Field>

      <Field label="Why do you want to be an ambassador? Any ideas for your school? *">
        <textarea
          required
          rows={4}
          value={form.why}
          onChange={(e) => update('why', e.target.value)}
          className="w-full rounded-card border border-card-border bg-white px-4 py-2.5 text-sm outline-none"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="How much time could you give?">
          <select value={form.hoursPerMonth} onChange={(e) => update('hoursPerMonth', e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            {HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </Field>
        <Field label="How'd you hear about us?">
          <input value={form.heardFrom} onChange={(e) => update('heardFrom', e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)">
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Instagram / TikTok (optional)">
          <input
            placeholder="@yourhandle"
            value={form.socialHandle}
            onChange={(e) => update('socialHandle', e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {error && <p className="text-sm font-semibold text-coral">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-brand-green/50">
          Only the VolunteerVault team sees this. We'll just use it to get in touch about the ambassador role.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-coral px-6 py-2.5 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none disabled:opacity-50"
        >
          {busy ? 'Sending...' : 'Send my interest'}
        </button>
      </div>
    </form>
  )
}

// A little "lanyard badge" that fills in live as they type — makes the form
// feel like you're already on the team.
function BadgePreview({ name, school, gradYear }) {
  return (
    <div className="mx-auto w-full max-w-xs -rotate-2 overflow-hidden rounded-card border-2 border-brand-green bg-cream shadow-pop transition-transform hover:rotate-0">
      <div className="flex items-center justify-between bg-brand-green px-4 py-2">
        <span className="font-display text-sm font-extrabold text-cream-text">
          Volunteer<span className="text-gold">VAULT</span>
        </span>
        <span className="text-lg" aria-hidden>
          📣
        </span>
      </div>
      <div className="px-4 py-3 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-coral">School Ambassador</p>
        <p className="mt-1 truncate font-display text-xl font-extrabold text-brand-green">{name.trim() || 'Your Name'}</p>
        <p className="truncate text-sm font-semibold text-brand-green/70">{school.trim() || 'Your School'}</p>
        {gradYear && <p className="text-xs text-brand-green/50">Class of {gradYear}</p>}
      </div>
      <p className="border-t border-dashed border-card-border py-1.5 text-center text-[10px] font-bold text-brand-green/40">
        preview · fills in as you type
      </p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}
