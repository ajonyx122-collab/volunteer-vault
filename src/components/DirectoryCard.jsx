export default function DirectoryCard({ opportunity }) {
  const { name, url, categories, ageNote, ageVerified, verifiesHours, virtual, description } = opportunity

  return (
    <div className="flex flex-col gap-3 rounded-card border border-card-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display font-bold text-brand-green">{name}</h3>
          {verifiesHours && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-category-environment-bg px-2 py-0.5 text-xs font-bold text-category-environment-text">
              <span aria-hidden="true">✓</span> Verifies hours
            </span>
          )}
          {virtual && (
            <span className="rounded-pill bg-category-tech-bg px-2 py-0.5 text-xs font-bold text-category-tech-text">
              🌐 Virtual
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-brand-green/70">{description}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {categories.map((cat) => (
            <span key={cat} className="rounded-pill bg-cream px-2 py-0.5 font-semibold text-brand-green/70">
              {cat}
            </span>
          ))}
          <span className="rounded-pill border border-card-border px-2 py-0.5 font-semibold text-brand-green/60">
            {ageNote}
          </span>
          {!ageVerified && (
            <span className="text-brand-green/50">confirm age on their site</span>
          )}
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-pill bg-coral px-5 py-2 text-center text-sm font-bold text-cream-text shadow-soft transition-transform hover:scale-105"
      >
        Visit site
      </a>
    </div>
  )
}
