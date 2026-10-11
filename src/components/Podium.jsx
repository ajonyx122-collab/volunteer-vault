'use client'

const MEDALS = ['🥇', '🥈', '🥉']
const HEIGHTS = ['h-28 sm:h-32', 'h-20 sm:h-24', 'h-14 sm:h-16']

// Top-3 podium (2nd · 1st · 3rd). `entries` are leaderboard rows with
// { userId, displayName, value }. Pass onSelect to make each spot clickable.
export default function Podium({ entries, unit = 'hrs', onSelect }) {
  if (!entries?.length) return null
  return (
    <div className="mx-auto grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
      {[1, 0, 2].map((idx) => {
        const e = entries[idx]
        if (!e) return <div key={idx} />
        const Wrap = onSelect ? 'button' : 'div'
        return (
          <Wrap
            key={e.userId}
            {...(onSelect ? { type: 'button', onClick: () => onSelect(e), title: 'See where their hours went' } : {})}
            className="group flex flex-col items-center"
          >
            <span className={`text-3xl transition-transform ${onSelect ? 'group-hover:-translate-y-1 group-hover:scale-110' : ''}`}>
              {MEDALS[idx]}
            </span>
            <p className="mt-1 w-full truncate text-center text-xs font-extrabold text-brand-green sm:text-sm">{e.displayName}</p>
            <p className="text-xs font-bold text-brand-green/60">
              {e.value}
              {unit === 'wk' ? ' wk' : ' hrs'}
            </p>
            <div
              className={`mt-2 flex w-full items-start justify-center rounded-t-card border-2 border-b-0 border-brand-green pt-2 font-display text-2xl font-extrabold ${HEIGHTS[idx]} ${
                idx === 0 ? 'bg-gold text-gold-text' : 'bg-cream text-brand-green'
              }`}
            >
              {idx + 1}
            </div>
          </Wrap>
        )
      })}
    </div>
  )
}
