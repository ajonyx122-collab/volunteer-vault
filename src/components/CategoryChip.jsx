import Link from 'next/link'
import { CATEGORY_STYLES } from './categoryStyles'

export default function CategoryChip({ id, label, icon, active = false, href }) {
  const styles = CATEGORY_STYLES[id]?.chip ?? 'bg-card-border text-brand-green'

  return (
    <Link
      href={href ?? `/browse?category=${id}`}
      className={`flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${styles} ${
        active ? 'ring-2 ring-gold' : ''
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </Link>
  )
}
