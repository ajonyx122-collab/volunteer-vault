const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

// Renders the org's real logo once orgs can upload one (Phase 2 storage).
// Until then every org gets a consistent initials avatar instead of a
// generic placeholder icon.
export default function OrgAvatar({ org, size = 'md' }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  if (org?.logoUrl) {
    return (
      <img
        src={org.logoUrl}
        alt={org.name}
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-green font-display font-bold text-cream-text ${sizeClass}`}
    >
      {getInitials(org?.name)}
    </div>
  )
}
