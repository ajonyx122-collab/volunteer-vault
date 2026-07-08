import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCategoryMeta } from '../data/mockData'
import { fetchProfileByUsername, fetchHourLogs, buildVaultData } from '../lib/api'
import { downloadHoursCsv } from '../lib/csv'

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

  const { user, activity } = vault
  const issuedOn = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  // Stable, checkable ID derived from the account — not a random number.
  const certId = `VV-${user.id.replaceAll('-', '').slice(0, 8).toUpperCase()}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/u/${user.username}`} className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
          ← Back to vault
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => downloadHoursCsv(user, activity)}
            className="rounded-pill border border-card-border bg-card px-5 py-2 text-sm font-bold text-brand-green shadow-card"
          >
            ⬇ Hours spreadsheet
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-card border-4 border-double border-brand-green bg-card p-10 text-center shadow-card sm:p-14">
        {/* corner flourishes */}
        <div className="pointer-events-none absolute left-3 top-3 h-10 w-10 border-l-2 border-t-2 border-gold" />
        <div className="pointer-events-none absolute right-3 top-3 h-10 w-10 border-r-2 border-t-2 border-gold" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-10 w-10 border-b-2 border-l-2 border-gold" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-10 w-10 border-b-2 border-r-2 border-gold" />

        <img src="/brand/logo-icon.png" alt="" className="mx-auto h-14 w-14" />
        <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-gold-text">
          Certificate of Verified Service
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-brand-green/40">
          Certificate No. {certId}
        </p>

        <p className="mt-8 text-sm italic text-brand-green/60">This certifies that</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-green sm:text-4xl">
          {user.displayName}
        </h1>
        {user.school && (
          <p className="mt-2 text-brand-green/70">
            {user.school}
            {user.gradYear ? ` · Class of ${user.gradYear}` : ''}
          </p>
        )}

        <p className="mx-auto mt-6 max-w-md text-brand-green/80">
          has completed and had organization-verified
        </p>
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

        <div className="mt-12 flex items-end justify-between gap-6 text-left">
          {/* seal */}
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-gold bg-cream text-center">
            <span className="text-xl">✓</span>
            <span className="px-1 font-display text-[9px] font-bold uppercase leading-tight tracking-wide text-gold-text">
              Verified · VolunteerVault
            </span>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xs text-brand-green/50">Issued {issuedOn}</p>
            <p className="mt-1 text-xs text-brand-green/50">
              Verify this record live at{' '}
              <span className="font-bold text-brand-green/70">volunteervault.org/u/{user.username}</span>
            </p>
          </div>

          {/* signature */}
          <div className="shrink-0 text-center">
            <p
              className="text-2xl text-brand-green"
              style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
            >
              VolunteerVault
            </p>
            <div className="mt-1 h-px w-40 bg-brand-green/40" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-green/50">
              Verification team
            </p>
          </div>
        </div>

        <p className="mt-8 text-[10px] text-brand-green/40">
          Hours marked verified were confirmed by the hosting organization through VolunteerVault check-in.
          This certificate is valid only alongside its live vault record.
        </p>
      </div>
    </div>
  )
}
