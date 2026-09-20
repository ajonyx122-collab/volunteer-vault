'use client'

import { useEffect, useRef, useState } from 'react'

// Counts up from 0 to `end` the first time it scrolls into view, with an
// ease-out so it decelerates into the final number. Falls back to the final
// value immediately if the observer isn't available or motion is reduced.
export default function CountUp({ end = 0, duration = 1400, className }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setVal(end)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return
        done.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration)
          setVal(Math.round(end * (1 - Math.pow(1 - t, 3))))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString()}
    </span>
  )
}
