import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchHourLogs, buildVaultData, updateProfile } from '../lib/api'
import VaultView from '../components/VaultView'

export default function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [vault, setVault] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftSchool, setDraftSchool] = useState('')
  const [draftGradYear, setDraftGradYear] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!user || !profile) return
    fetchHourLogs(user.id).then((logs) => setVault(buildVaultData(profile, logs)))
  }, [user, profile])

  function startEditing() {
    setDraftName(profile.display_name ?? '')
    setDraftSchool(profile.school ?? '')
    setDraftGradYear(profile.grad_year ?? '')
    setSaveError('')
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      await updateProfile(user.id, {
        displayName: draftName.trim() || profile.display_name,
        school: draftSchool,
        gradYear: draftGradYear,
      })
      await refreshProfile()
      setEditing(false)
    } catch {
      setSaveError("Couldn't save — check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading...</div>
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Your vault is waiting</h1>
        <p className="text-brand-green/70">Log in to see your hours, badges, and streak.</p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-pill bg-gold px-6 py-3 text-sm font-bold text-gold-text shadow-soft transition-transform hover:scale-105"
          >
            Join free
          </Link>
        </div>
      </div>
    )
  }

  if (!vault) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading your vault...</div>
  }

  return (
    <div>
      <VaultView user={vault.user} activity={vault.activity} isOwner onEdit={startEditing} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-green/40 p-4">
          <form
            onSubmit={handleSave}
            className="flex w-full max-w-sm flex-col gap-3 rounded-card border border-card-border bg-card p-6 shadow-soft"
          >
            <h2 className="font-display text-xl font-extrabold text-brand-green">Edit profile</h2>
            <label className="text-xs font-bold text-brand-green/60">
              Display name
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
              />
            </label>
            <label className="text-xs font-bold text-brand-green/60">
              School, college, or organization
              <input
                placeholder="e.g. Lincoln High School"
                value={draftSchool}
                onChange={(e) => setDraftSchool(e.target.value)}
                className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
              />
            </label>
            <label className="text-xs font-bold text-brand-green/60">
              Graduation year (optional)
              <input
                type="number"
                min="2024"
                max="2032"
                placeholder="e.g. 2027"
                value={draftGradYear}
                onChange={(e) => setDraftGradYear(e.target.value)}
                className="mt-1 w-full rounded-pill border border-card-border px-4 py-2.5 text-sm font-normal text-brand-green outline-none"
              />
            </label>
            {saveError && <p className="text-sm font-semibold text-coral">{saveError}</p>}
            <div className="mt-1 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-pill bg-brand-green py-2.5 text-sm font-bold text-cream-text shadow-soft disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-pill border border-card-border py-2.5 text-sm font-bold text-brand-green"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
