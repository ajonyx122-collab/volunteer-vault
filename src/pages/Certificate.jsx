import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { getCategoryMeta } from '../data/mockData'
import { fetchProfileByUsername, fetchHourLogs, buildVaultData } from '../lib/api'
import { downloadHoursCsv } from '../lib/csv'

const serif = { fontFamily: "'Playfair Display', Georgia, serif" }

export default function Certificate() {
  const { username } = useParams()
  const [vault, setVault] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')

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

  useEffect(() => {
    if (!vault) return
    QRCode.toDataURL(`${window.location.origin}/u/${vault.user.username}`, {
      margin: 1,
      width: 200,
      color: { dark: '#1B4A30', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(''))
  }, [vault])

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
  const certId = `VV-${user.id.replaceAll('-', '').slice(0, 8).toUpperCase()}`
  const orgNames = [...new Set(activity.filter((a) => a.status === 'verified' && a.orgName).map((a) => a.orgName))]

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
            className="rounded-pill bg-coral px-5 py-2 text-sm font-bold text-cream-text shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-y-0 active:shadow-none"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border-[3px] border-brand-green bg-white p-1 shadow-card">
        <div className="border border-gold p-8 text-center sm:p-12">
          {/* header */}
          <div className="flex items-center justify-center gap-3">
            <img src="/brand/logo-icon.png" alt="" className="h-12 w-12" />
            <div className="text-left">
              <p className="font-display text-sm font-extrabold leading-tight text-brand-green">
                Volunteer<span className="text-gold">VAULT</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-brand-green/50">
                Verified service records
              </p>
            </div>
          </div>

          <div className="mx-auto mt-8 h-px w-24 bg-gold" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-brand-green/60">
            Certificate of Verified Service
          </p>

          <p className="mt-8 text-sm italic text-brand-green/60" style={serif}>
            This is to certify that
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-green sm:text-5xl" style={serif}>
            {user.displayName}
          </h1>
          {user.school && (
            <p className="mt-3 text-sm text-brand-green/70">
              {user.school}
              {user.gradYear ? ` · Class of ${user.gradYear}` : ''}
            </p>
          )}

          <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-brand-green/80" style={serif}>
            has completed{' '}
            <span className="text-2xl font-semibold text-brand-green">{user.verifiedHours}</span>{' '}
            hours of community service, self-reported on the honor system and verified through
            VolunteerVault once each service date passed
            {orgNames.length > 0 && (
              <>
                {' '}
                — including service with{' '}
                <span className="font-semibold">{orgNames.slice(0, 3).join(', ')}</span>
                {orgNames.length > 3 ? ` and ${orgNames.length - 3} more` : ''}
              </>
            )}
            .
          </p>

          {user.causes.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
              {user.causes.map((c) => {
                const meta = getCategoryMeta(c.category)
                return (
                  <span
                    key={c.category}
                    className="rounded-pill border border-card-border bg-cream px-3 py-1 text-xs font-bold text-brand-green"
                  >
                    {meta?.icon} {meta?.label} · {c.hours}h
                  </span>
                )
              })}
            </div>
          )}

          {/* signature block */}
          <div className="mt-12 grid items-end gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl text-brand-green" style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}>
                VolunteerVault
              </p>
              <div className="mx-auto mt-1 h-px w-40 bg-brand-green/40" />
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-brand-green/50">
                VolunteerVault verification
              </p>
            </div>

            <div className="flex flex-col items-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Scan to verify" className="h-24 w-24" />
              ) : (
                <div className="h-24 w-24 rounded-card bg-cream" />
              )}
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-brand-green/50">
                Scan to verify live
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-8" />
              <div className="mx-auto mt-1 h-px w-40 bg-brand-green/40" />
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-brand-green/50">
                Supervisor / advisor
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[10px] text-brand-green/50">
            <span>Certificate No. {certId}</span>
            <span>Issued {issuedOn}</span>
            <span>volunteervault.org/u/{user.username}</span>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-brand-green/40">
            Hours are self-reported by the volunteer under an honesty pledge and marked verified once
            the logged service date has passed. This certificate accompanies a live record at the
            address above — if the numbers here and there disagree, trust the live record.
          </p>
        </div>
      </div>
    </div>
  )
}
