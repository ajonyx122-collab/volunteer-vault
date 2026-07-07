import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchHourLogs, buildVaultData } from '../lib/api'
import VaultView from '../components/VaultView'

export default function Profile() {
  const { user, profile, loading } = useAuth()
  const [vault, setVault] = useState(null)

  useEffect(() => {
    if (!user || !profile) return
    fetchHourLogs(user.id).then((logs) => setVault(buildVaultData(profile, logs)))
  }, [user, profile])

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

  return <VaultView user={vault.user} activity={vault.activity} isOwner />
}
