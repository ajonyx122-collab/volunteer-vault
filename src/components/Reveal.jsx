'use client'

import { useEffect, useRef, useState } from 'react'

// Fades + slides its children in the first time they scroll into view. The
// content is always in the DOM (just visually offset), so it stays
// crawlable/accessible; if the observer never runs, it reveals on mount.
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    // Safety net: the observer can't fire in a backgrounded/non-composited tab.
    // Never leave content hidden — reveal it regardless after a short beat, and
    // reveal immediately if the element is already within the viewport.
    const rect = el.getBoundingClientRect()
    if (rect.top < (window.innerHeight || 0) && rect.bottom > 0) setShown(true)
    const t = setTimeout(() => setShown(true), 1200)
    return () => {
      obs.disconnect()
      clearTimeout(t)
    }
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}
