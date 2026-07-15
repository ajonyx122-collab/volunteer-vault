const WEEKS = 18

function buildGrid(servedDates) {
  const hoursByDate = Object.fromEntries(servedDates.map((d) => [d.date, d.hours]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay())) // align to end of this week (Saturday)
  const start = new Date(end)
  start.setDate(start.getDate() - (WEEKS * 7 - 1))

  const weeks = []
  const cursor = new Date(start)
  for (let w = 0; w < WEEKS; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10)
      days.push({ date: key, hours: hoursByDate[key] ?? 0, future: cursor > today })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(days)
  }
  return weeks
}

function tierClass(hours) {
  if (hours <= 0) return 'bg-card-border'
  if (hours <= 1) return 'bg-brand-green/25'
  if (hours <= 3) return 'bg-brand-green/50'
  if (hours <= 6) return 'bg-brand-green/75'
  return 'bg-brand-green'
}

// GitHub-style contribution grid over the trailing ~18 weeks, shaded by
// verified hours served that day. Plain CSS grid, no charting library.
export default function HoursHeatmap({ servedDates }) {
  const weeks = buildGrid(servedDates ?? [])

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={day.future ? '' : day.hours > 0 ? `${day.date} — ${day.hours} hrs` : day.date}
                className={`h-3 w-3 rounded-sm ${day.future ? 'bg-transparent' : tierClass(day.hours)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-green/50">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-card-border" />
        <div className="h-3 w-3 rounded-sm bg-brand-green/25" />
        <div className="h-3 w-3 rounded-sm bg-brand-green/50" />
        <div className="h-3 w-3 rounded-sm bg-brand-green/75" />
        <div className="h-3 w-3 rounded-sm bg-brand-green" />
        <span>More</span>
      </div>
    </div>
  )
}
