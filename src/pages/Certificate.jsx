import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import { fetchProfileByUsername, fetchHourLogs, buildVaultData } from '../lib/api'

export default function Certificate() {
  const { username } = useParams()
  const [vault, setVault] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading certificate...</div>
  }

  if (!vault) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Certificate not found</h1>
        <Link to="/browse" className="font-bold text-coral hover:underline">
          Back to browse
        </Link>
      </div>
    )
  }

  const { user } = vault
  const issuedOn = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link to={`/u/${user.username}`} className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
          ← Back to vault
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="rounded-card border-4 border-double border-brand-green bg-card p-10 text-center shadow-card sm:p-14">
        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-gold-text">
          Certificate of Verified Service
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-green sm:text-4xl">
          {user.displayName}
        </h1>
        {user.school && (
          <p className="mt-2 text-brand-green/70">
            {user.school}{user.gradYear ? ` · Class of ${user.gradYear}` : ''}
          </p>
        )}

        <p className="mx-auto mt-8 max-w-md text-brand-green/80">has completed and had verified</p>
        <p className="mt-2 font-display text-5xl font-extrabold text-coral">{user.verifiedHours}</p>
        <p className="text-brand-green/80">hours of community service</p>

        {user.causes.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
            {user.causes.map((c) => {
              const meta = getCategoryMeta(c.category)
              return (
                <span key={c.category} className="rounded-pill bg-cream px-3 py-1 text-xs font-bold text-brand-green">
                  {meta?.icon} {meta?.label} · {c.hours}h
                </span>
              )
            })}
          </div>
        )}

        <div className="mx-auto mt-10 h-px w-32 bg-card-border" />
        <p className="mt-4 text-xs text-brand-green/50">
          Verified through org check-ins on VolunteerVault · Issued {issuedOn}
        </p>
        <p className="text-xs text-brand-green/50">volunteervault.org/u/{user.username}</p>
      </div>
    </div>
  )
}
