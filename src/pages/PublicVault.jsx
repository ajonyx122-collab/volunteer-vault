import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProfileByUsername, fetchHourLogs, buildVaultData } from '../lib/api'
import VaultView from '../components/VaultView'

export default function PublicVault() {
  const { username } = useParams()
  const [vault, setVault] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProfileByUsername(username)
      .then(async (profileRow) => {
        if (!profileRow) {
          setVault(null)
          return
        }
        const logs = await fetchHourLogs(profileRow.id)
        setVault(buildVaultData(profileRow, logs))
      })
      .catch(() => setVault(null))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading vault...</div>
  }

  if (!vault) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <img src="/brand/logo-icon.png" alt="" className="h-14 w-14" />
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Vault not found</h1>
        <p className="text-brand-green/70">
          There's no VolunteerVault profile at this link — double-check the username.
        </p>
        <Link
          to="/browse"
          className="rounded-pill bg-coral px-6 py-3 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          Browse opportunities instead
        </Link>
      </div>
    )
  }

  return <VaultView user={vault.user} activity={vault.activity} isOwner={false} />
}
