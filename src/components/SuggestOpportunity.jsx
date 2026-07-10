import { useState } from 'react'
import { US_STATES } from '../data/mockData'
import { submitSuggestion } from '../lib/api'

const emptyDraft = { orgName: '', website: '', notes: '', city: '', state: '', submitterEmail: '' }

export default function SuggestOpportunity() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function update(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await submitSuggestion(draft)
      setSent(true)
      setDraft(emptyDraft)
    } catch {
      setError("Couldn't send that — check your connection and try again.")
    }
    setBusy(false)
  }

  return (
    <section className="rounded-card border border-card-border bg-card p-5 shadow-card sm:p-6">
      {sent ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-brand-green">
            🙌 Thanks! We'll check it out and add it if it's a good fit.
          </p>
          <button
            onClick={() => {
              setSent(false)
              setOpen(false)
            }}
            className="rounded-pill border border-card-border px-4 py-1.5 text-xs font-bold text-brand-green"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-brand-green">
                💡 Know a place that should be here?
              </p>
              <p className="mt-0.5 text-sm text-brand-green/60">
                Suggest an organization and we'll add it to the directory.
              </p>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
            >
              {open ? 'Cancel' : 'Suggest an opportunity'}
            </button>
          </div>

          {open && (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Organization name"
                  value={draft.orgName}
                  onChange={(e) => update('orgName', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <input
                  required
                  type="url"
                  placeholder="Website (https://...)"
                  value={draft.website}
                  onChange={(e) => update('website', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <textarea
                required
                placeholder="What do they do, and why should volunteers know about them?"
                value={draft.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                className="rounded-card border border-card-border px-4 py-2.5 text-sm outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="City (optional)"
                  value={draft.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
                <select
                  value={draft.state}
                  onChange={(e) => update('state', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                >
                  <option value="">State (optional)</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={draft.submitterEmail}
                  onChange={(e) => update('submitterEmail', e.target.value)}
                  className="rounded-pill border border-card-border px-4 py-2.5 text-sm outline-none"
                />
              </div>
              {error && <p className="text-sm font-semibold text-coral">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="self-start rounded-pill bg-brand-green px-6 py-2.5 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
              >
                {busy ? 'Sending...' : 'Send suggestion'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  )
}
