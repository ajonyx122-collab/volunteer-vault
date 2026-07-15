import { useEffect, useMemo, useState } from 'react'
import { fetchLeaderboardData, buildLeaderboards } from '../lib/api'
import { CATEGORIES } from '../data/mockData'
import { useAuth } from '../lib/AuthContext'

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
  const [mySchoolOnly, setMySchoolOnly] = useState(false)

  useEffect(() => {
    fetchLeaderboardData()
      .then(({ rows, profiles }) => setData(buildLeaderboards(rows, profiles)))
      .catch(() => setData({ allTime: [], thisMonth: [], streak: [], byCategory: {} }))
  }, [])

  const fullList = useMemo(() => {
    if (!data) return []
    return tab === 'byCause' ? (data.byCategory[category] ?? []) : data[tab]
  }, [data, tab, category])

  const list = useMemo(() => {
    if (!mySchoolOnly || !profile?.school) return fullList
    return fullList.filter((e) => e.school === profile.school)
  }, [fullList, mySchoolOnly, profile])

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
        Real people, real hours, real bragging rights. See who's crushing it.
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

      {profile?.school && (
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-green/70">
          <input
            type="checkbox"
            checked={mySchoolOnly}
            onChange={(e) => setMySchoolOnly(e.target.checked)}
          />
          Show only {profile.school}
        </label>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="rounded-card border border-card-border bg-card p-6 text-center text-brand-green/60 shadow-card">
            Nobody's on the board here yet — be the first to log hours and claim the top spot.
          </p>
        )}
        {visible.map((e) => (
          <div
            key={e.userId}
            className={`flex items-center gap-3 rounded-card border-2 p-3 ${
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
              {e.school && <p className="truncate text-xs text-brand-green/50">{e.school}</p>}
            </div>
            <p className="shrink-0 font-display font-extrabold text-brand-green">
              {e.value}
              {activeTab.unit === 'wk' ? 'wk' : ' hrs'}
            </p>
          </div>
        ))}
      </div>

      {myEntry && !meVisible && (
        <p className="mt-3 text-center text-sm font-semibold text-brand-green/60">
          You're #{myEntry.rank} with {myEntry.value}
          {activeTab.unit === 'wk' ? 'wk' : ' hrs'}
        </p>
      )}
    </div>
  )
}
