'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchLeaderboardData, buildLeaderboards } from '../../lib/api'
import { CATEGORIES } from '../../data/mockData'
import { PIN_COLORS } from '../../lib/mapColors'
import { useAuth } from '../../lib/AuthContext'

const CAT_META = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

const TABS = [
  { id: 'allTime', label: 'All-time hours', unit: 'hrs' },
  { id: 'thisMonth', label: 'This month', unit: 'hrs' },
  { id: 'streak', label: 'Streak', unit: 'wk' },
  { id: 'byCause', label: 'By cause', unit: 'hrs' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const VISIBLE = 25

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Leaderboards() {
  const { profile } = useAuth()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('allTime')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [selected, setSelected] = useState(null) // entry whose breakdown popup is open

  useEffect(() => {
    fetchLeaderboardData()
      .then(({ rows, profiles }) => setData(buildLeaderboards(rows, profiles)))
      .catch(() => setData({ allTime: [], thisMonth: [], streak: [], byCategory: {} }))
  }, [])

  const list = useMemo(() => {
    if (!data) return []
    return tab === 'byCause' ? (data.byCategory[category] ?? []) : data[tab]
  }, [data, tab, category])
  const fullList = list

  const activeTab = TABS.find((t) => t.id === tab)
  const myEntry = profile ? fullList.find((e) => e.userId === profile.id) : null
  const visible = list.slice(0, VISIBLE)
  const meVisible = visible.some((e) => e.userId === profile?.id)

  if (!data) {
    return <div className="px-4 py-16 text-center text-brand-green/60">Loading leaderboards...</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-sticker font-display text-4xl font-extrabold">Leaderboards</h1>
      <p className="mt-2 text-brand-green/70">
        See who's racking up the most service hours. Log yours to climb the board.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.id
                ? 'bg-brand-green text-cream-text'
                : 'border border-card-border bg-card text-brand-green hover:bg-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'byCause' && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                category === c.id
                  ? 'bg-gold text-gold-text'
                  : 'border border-card-border bg-card text-brand-green/70 hover:bg-cream'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
            Nobody's on the board here yet — be the first to log hours and claim the top spot.
          </p>
        )}
        {visible.map((e) => (
          <button
            key={e.userId}
            onClick={() => setSelected(e)}
            title="See where their hours went"
            className={`flex w-full items-center gap-3 rounded-card border-2 p-3 text-left transition-transform hover:-translate-y-0.5 ${
              e.userId === profile?.id
                ? 'border-gold bg-category-food-bg shadow-pop-soft'
                : 'border-brand-green bg-card shadow-pop-soft'
            }`}
          >
            <span className="w-8 shrink-0 text-center font-display text-lg font-extrabold text-brand-green/60">
              {MEDALS[e.rank - 1] ?? e.rank}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-xs font-extrabold text-cream-text">
              {initials(e.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-brand-green">
                {e.displayName}
                {e.username && <span className="ml-1 font-normal text-brand-green/50">@{e.username}</span>}
              </p>
            </div>
            <p className="shrink-0 font-display font-extrabold text-brand-green">
              {e.value}
              {activeTab.unit === 'wk' ? 'wk' : ' hrs'}
            </p>
          </button>
        ))}
      </div>

      {myEntry && !meVisible && (
        <p className="mt-3 text-center text-sm font-semibold text-brand-green/60">
          You're #{myEntry.rank} with {myEntry.value}
          {activeTab.unit === 'wk' ? 'wk' : ' hrs'}
        </p>
      )}

      {selected && <PersonBreakdown entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

// Cute click-through popup: shows how one person's hours split across causes.
function PersonBreakdown({ entry, onClose }) {
  const cats = Object.entries(entry.categories ?? {})
    .filter(([, hrs]) => hrs > 0)
    .sort((a, b) => b[1] - a[1])
  const total = cats.reduce((s, [, hrs]) => s + hrs, 0)
  const max = cats.length ? cats[0][1] : 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-green/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card border border-card-border bg-card p-5 shadow-pop-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-sm font-extrabold text-cream-text">
            {initials(entry.displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-extrabold text-brand-green">
              {entry.displayName}
            </p>
            <p className="text-xs font-semibold text-brand-green/50">
              {total} verified hrs · {cats.length} cause{cats.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full border border-card-border px-2.5 py-1 text-sm font-bold text-brand-green/60 hover:bg-cream"
          >
            ✕
          </button>
        </div>

        <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-green/50">
          Where their hours went
        </p>
        {cats.length === 0 ? (
          <p className="text-sm text-brand-green/50">No hours logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cats.map(([id, hrs]) => {
              const meta = CAT_META[id]
              return (
                <div key={id}>
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-green">
                    <span>
                      {meta?.icon ?? '•'} {meta?.label ?? id}
                    </span>
                    <span className="text-brand-green/60">{hrs} hrs</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-pill bg-card-border">
                    <div
                      className="h-full rounded-pill"
                      style={{ width: `${(hrs / max) * 100}%`, background: PIN_COLORS[id] ?? '#1B4A30' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
