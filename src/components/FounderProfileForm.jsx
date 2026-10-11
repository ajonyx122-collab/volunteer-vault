'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateFounderProfile } from '../lib/api'
import { FOUNDER_STATUS_LABELS } from '../lib/opportunityMapping'

const inputClass =
  'mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none'
const areaClass =
  'mt-1 w-full rounded-card border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none'
const labelClass = 'text-xs font-bold text-brand-green/60'

function draftFrom(org) {
  const s = (v) => (v == null ? '' : String(v))
  return {
    isStudentLed: org.isStudentLed,
    founderName: s(org.founderName),
    founderSchool: s(org.founderSchool),
    founderStatus: s(org.founderStatus),
    foundedYear: s(org.foundedYear),
    mission: s(org.mission),
    founderStory: s(org.founderStory),
    donateUrl: s(org.donateUrl),
    goalTitle: s(org.goalTitle),
    goalUnit: s(org.goalUnit),
    goalTarget: s(org.goalTarget),
    goalCurrent: s(org.goalCurrent),
  }
}

// Org dashboard → Organization tab: the student-founder profile that powers
// the org's public /student-led/[id] page.
export default function FounderProfileForm({ org, onSaved }) {
  const [d, setD] = useState(() => draftFrom(org))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (field, value) => setD((prev) => ({ ...prev, [field]: value }))
  const thisYear = new Date().getFullYear()

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await updateFounderProfile(org.id, d)
      onSaved?.(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message ?? 'Could not save.')
    }
    setBusy(false)
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-6 flex flex-col gap-3 rounded-card border-2 border-gold bg-card p-5 shadow-card"
    >
      <div>
        <h2 className="font-display text-xl font-extrabold text-brand-green">🎓 Student founder profile</h2>
        <p className="mt-1 text-sm text-brand-green/60">
          Started this as a high school or college student (or recently graduated)? Turn this on to
          get a page in the Student-Led section with your mission, a goal tracker, and a donate
          button.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-bold text-brand-green">
        <input
          type="checkbox"
          checked={d.isStudentLed}
          onChange={(e) => set('isStudentLed', e.target.checked)}
          className="h-4 w-4 accent-[#1B5E38]"
        />
        This is a student-founded nonprofit
      </label>

      {d.isStudentLed && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Founder name(s) *
              <input required value={d.founderName} onChange={(e) => set('founderName', e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              School you go to (or went to) *
              <input
                required
                placeholder="e.g. Lincoln High School"
                value={d.founderSchool}
                onChange={(e) => set('founderSchool', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              You are a... *
              <select required value={d.founderStatus} onChange={(e) => set('founderStatus', e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {Object.entries(FOUNDER_STATUS_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Year you started it
              <input
                type="number"
                min={1990}
                max={thisYear}
                value={d.foundedYear}
                onChange={(e) => set('foundedYear', e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className={labelClass}>
            Mission — one or two sentences *
            <textarea
              required
              rows={2}
              maxLength={300}
              placeholder="e.g. We collect and repair used laptops for students who don't have one at home."
              value={d.mission}
              onChange={(e) => set('mission', e.target.value)}
              className={areaClass}
            />
          </label>
          <label className={labelClass}>
            Your story — why did you start it?
            <textarea
              rows={4}
              value={d.founderStory}
              onChange={(e) => set('founderStory', e.target.value)}
              className={areaClass}
            />
          </label>

          <div className="rounded-card bg-cream p-4">
            <p className="text-sm font-bold text-brand-green">🎯 Current goal (optional)</p>
            <p className="text-xs text-brand-green/60">Shows as a progress bar on your page. Update the number as you go.</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Goal
                <input
                  placeholder="e.g. Pack 500 meals by December"
                  value={d.goalTitle}
                  onChange={(e) => set('goalTitle', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Counting in...
                <input
                  placeholder="e.g. meals, $, laptops"
                  value={d.goalUnit}
                  onChange={(e) => set('goalUnit', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Target
                <input type="number" min={0} value={d.goalTarget} onChange={(e) => set('goalTarget', e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Progress so far
                <input type="number" min={0} value={d.goalCurrent} onChange={(e) => set('goalCurrent', e.target.value)} className={inputClass} />
              </label>
            </div>
          </div>

          <label className={labelClass}>
            Donate link (optional) — GoFundMe, Givebutter, PayPal, your own site...
            <input
              type="url"
              placeholder="https://..."
              value={d.donateUrl}
              onChange={(e) => set('donateUrl', e.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block font-normal text-brand-green/50">
              The Donate button appears on your page once a VolunteerVault admin verifies your org.
              Donations go straight to you — we never handle money.
            </span>
          </label>
        </>
      )}

      {error && <p className="text-sm font-semibold text-coral">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-brand-green px-6 py-2 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Save founder profile'}
        </button>
        {saved && <p className="text-xs font-semibold text-brand-green/60">✓ Saved</p>}
        {org.isStudentLed && (
          <Link href={`/student-led/${org.id}`} className="text-xs font-bold text-coral hover:underline">
            View your public page →
          </Link>
        )}
      </div>
    </form>
  )
}
