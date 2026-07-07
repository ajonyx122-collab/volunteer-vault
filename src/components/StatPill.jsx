export default function StatPill({ value, label, tone = 'light' }) {
  const toneClasses =
    tone === 'light'
      ? 'bg-card border border-card-border text-brand-green'
      : 'bg-brand-green-light/60 text-cream-text'

  return (
    <div className={`flex flex-col items-center gap-0.5 rounded-card px-5 py-3 shadow-card ${toneClasses}`}>
      <span className="font-display text-xl font-extrabold">{value}</span>
      <span className="text-xs font-semibold opacity-80">{label}</span>
    </div>
  )
}
