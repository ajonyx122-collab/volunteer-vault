'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchLeaderboardData, buildLeaderboards } from '../../lib/api'
import { CATEGORIES } from '../../data/mockData'
import { PIN_COLORS } from '../../lib/mapColors'
import { useAuth } from '../../lib/AuthContext'
import FunHero, { Squiggle } from '../../components/FunHero'
import Podium from '../../components/Podium'

const CAT_META = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

const TABS = [
  { id: 'allTime', icon: '⏱️', label: 'All-time', unit: 'hrs' },
  { id: 'thisMonth', icon: '📅', label: 'This month', unit: 'hrs' },
  { id: 'streak', icon: '🔥', label: 'Streak', unit: 'wk' },
  { id: 'byCause', icon: '🌈', label: 'By cause', unit: 'hrs' },
]

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

  const activeTab = TABS.find((t) => t.id === tab)
  const myEntry = profile ? list.find((e) => e.userId === profile.id) : null
  const visible = list.slice(0, VISIBLE)
  const meVisible = visible.some((e) => e.userId === profile?.id)
  const unitLabel = activeTab.unit === 'wk' ? ' wk' : ' hrs'

  return (
    <div>
      <FunHero
        size="sm"
        eyebrow="🏆 Leaderboards"
        title={
          <>
            Who's <Squiggle>on top</Squiggle>?
          </>
        }
        subtitle="Real hours, ranked. Log yours and climb the board — tap anyone to see where their hours went."
        badges={[
          { e: '🥇', bg: 'bg-category-food-bg' },
          { e: '🔥', bg: 'bg-category-disaster-bg' },
          { e: '🏅', bg: 'bg-category-music-bg' },
          { e: '⏱️', bg: 'bg-category-environment-bg' },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {/* Chunky tab switch overlapping the hero edge */}
        <div className="relative -mt-7 grid grid-cols-2 gap-1.5 rounded-card border-2 border-brand-green bg-card p-1.5 shadow-pop-soft sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-[12px] px-3 py-2.5 text-sm font-extrabold transition-all ${
                tab === t.id ? 'bg-brand-green text-cream-text shadow-pop' : 'text-brand-green hover:bg-cream'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'byCause' && (
          <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`shrink-0 rounded-pill px-3 py-1.5 text-xs font-bold transition-colors ${
                  category === c.id
                    ? 'bg-gold text-gold-text shadow-pop'
                    : 'border border-card-border bg-card text-brand-green/70 hover:bg-cream'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        )}

        {!data && <p className="py-16 text-center text-brand-green/60">Loading the board...</p>}

        {data && visible.length === 0 && (
          <div className="mt-8 rounded-card border-2 border-dashed border-brand-green/40 bg-card p-8 text-center">
            <p className="animate-floaty inline-block text-5xl">🏁</p>
            <p className="mt-2 font-display text-xl font-extrabold text-brand-green">Nobody's here yet.</p>
            <p className="mt-1 text-sm text-brand-green/60">Log the first hours and claim the top spot.</p>
          </div>
        )}

        {visible.length > 0 && (
          <div className="bg-dots mt-8 rounded-card border-2 border-brand-green bg-card px-4 pt-6 shadow-pop-soft">
            <Podium entries={visible.slice(0, 3)} unit={activeTab.unit} onSelect={setSelected} />
          </div>
        )}

        <ol className="mt-5 flex flex-col gap-2">
          {visible.slice(3).map((e) => {
            const isMe = e.userId === profile?.id
            return (
              <li key={e.userId}>
                <button
                  onClick={() => setSelected(e)}
                  title="See where their hours went"
                  className={`flex w-full items-center gap-3 rounded-card border-2 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-pop ${
                    isMe ? 'border-gold bg-category-food-bg shadow-pop-soft' : 'border-brand-green bg-card shadow-pop-soft'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream font-display text-sm font-extrabold text-brand-green">
                    {e.rank}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-xs font-extrabold text-cream-text">
                    {initials(e.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-green">
                      {e.displayName}
                      {isMe && <span className="ml-1.5 rounded-pill bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-gold-text">YOU</span>}
                      {e.username && <span className="ml-1 hidden font-normal text-brand-green/50 sm:inline">@{e.username}</span>}
                    </p>
                  </div>
                  <p className="shrink-0 font-display font-extrabold text-brand-green">
                    {e.value}
                    {unitLabel}
                  </p>
                </button>
              </li>
            )
          })}
        </ol>

        {myEntry && !meVisible && (
          <p className="mt-4 rounded-pill bg-category-food-bg px-4 py-2 text-center text-sm font-bold text-gold-text">
            You're #{myEntry.rank} with {myEntry.value}
            {unitLabel} — keep going! 💪
          </p>
        )}
      </div>

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
        className="animate-pop-in w-full max-w-sm rounded-card border-2 border-brand-green bg-card p-5 shadow-pop-lg"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-sm font-extrabold text-cream-text">
            {initials(entry.displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-extrabold text-brand-green">{entry.displayName}</p>
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

        <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-green/50">Where their hours went</p>
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
