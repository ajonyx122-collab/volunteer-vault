import Link from 'next/link'

// Visible breadcrumb trail. `items` is [{ name, href }] — the same array passed
// to breadcrumbJsonLd so the on-page trail and the structured data stay in sync.
// The last item renders as the current page (not a link).
export default function Breadcrumb({ items }) {
  if (!items?.length) return null
  return (
    <nav aria-label="Breadcrumb" className="text-xs font-semibold text-brand-green/50">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.href} className="flex items-center gap-x-1.5">
              {isLast ? (
                <span aria-current="page" className="text-brand-green/70">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="hover:text-brand-green hover:underline">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-brand-green/30">
                    ›
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
