'use client'

import { useState } from 'react'
import { logHours, updateHourLog } from '../lib/api'
import { todayStr } from '../lib/hourLogs'

// Self-reported honor-system logging: pick a date served (past or future)
// and how many hours, pledge it's accurate. Verified status is computed
// elsewhere from served_on vs. today — nothing here needs org approval.
export default function LogHoursModal({ opportunity, userId, existingLog, onSaved, onClose }) {
  const isEdit = !!existingLog
  const [servedOn, setServedOn] = useState(existingLog?.servedOn ?? todayStr())
  const [hours, setHours] = useState(existingLog?.hours ?? opportunity.durationHours ?? 1)
  const [pledged, setPledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pledged) return
    setBusy(true)
    setError('')
    try {
      const saved = isEdit
        ? await updateHourLog(existingLog.id, { hours, servedOn })
        : await logHours({ userId, opportunityId: opportunity.id, hours, servedOn })
      onSaved(saved)
    } catch (err) {
      setError(
        err.code === '23505'
          ? "You've already logged hours for that date — edit the existing entry instead."
          : (err.message ?? "Couldn't save — try again."),
      )
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-green/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3 rounded-card border border-card-border bg-card p-6 shadow-soft"
      >
        <h2 className="font-display text-xl font-extrabold text-brand-green">
          {isEdit ? 'Edit your entry' : "I'm participating"}
        </h2>
        {!isEdit && (
          <p className="text-sm text-brand-green/70">
            Logging hours adds <span className="font-bold">{opportunity.org?.name}</span> to your
            service record. Pick the date you served (or plan to) and how many hours — it shows as
            verified on your vault once that date has passed.
          </p>
        )}
        <label className="text-xs font-bold text-brand-green/60">
          Date served
          <input
            type="date"
            required
            value={servedOn}
            onChange={(e) => setServedOn(e.target.value)}
            className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
          />
        </label>
        <label className="text-xs font-bold text-brand-green/60">
          Hours
          <input
            type="number"
            min="0.25"
            max="500"
            step="0.25"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
          />
        </label>
        <label className="mt-1 flex items-start gap-2 text-xs text-brand-green/70">
          <input
            type="checkbox"
            checked={pledged}
            onChange={(e) => setPledged(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <span>
            I pledge these hours are accurate — I only log time I actually attended (or definitely
            will). VolunteerVault runs on the honor system.
          </span>
        </label>
        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <div className="mt-1 flex gap-2">
          <button
            type="submit"
            disabled={busy || !pledged}
            className="flex-1 rounded-pill bg-brand-green py-2.5 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
          >
            {busy ? 'Saving...' : isEdit ? 'Save' : 'Log my hours'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-pill border border-card-border py-2.5 text-sm font-bold text-brand-green"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
