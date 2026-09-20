'use client'

import { useEffect, useState } from 'react'

// "Sunny" — a friendly sun buddy who waves and shares a rotating little tip.
// Purely decorative + encouraging; hidden on small screens so it never crowds
// the hero.
const TIPS = [
  'Psst — online roles count for hours too! 🌐',
  'Tap the 🤍 on any card to save it for later.',
  'Log your hours to grow your vault. 🌱',
  'Feeling lucky? Try Surprise Me. 🎲',
  'Every verified hour lands in your shareable vault. 🔒',
]

export default function Mascot() {
  const [tip, setTip] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-10 hidden select-none flex-col items-end lg:flex">
      <div
        key={tip}
        className="mb-2 max-w-[15rem] rounded-card rounded-br-sm border border-card-border bg-card px-3 py-2 text-right text-xs font-bold text-brand-green shadow-card"
      >
        {TIPS[tip]}
      </div>
      <svg width="128" height="128" viewBox="0 0 120 120" className="animate-floaty" aria-hidden>
        {/* rays — coords rounded so SSR and client render identical strings
            (raw Math.cos/sin can differ in the last float digit -> hydration
            mismatch) */}
        <g stroke="#F5C542" strokeWidth="5" strokeLinecap="round">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            const r = (n) => Math.round(n * 100) / 100
            return (
              <line
                key={i}
                x1={r(60 + Math.cos(a) * 38)}
                y1={r(55 + Math.sin(a) * 38)}
                x2={r(60 + Math.cos(a) * 48)}
                y2={r(55 + Math.sin(a) * 48)}
              />
            )
          })}
        </g>
        {/* body */}
        <circle cx="60" cy="55" r="34" fill="#F5C542" stroke="#E8983E" strokeWidth="3" />
        {/* cheeks */}
        <circle cx="45" cy="62" r="6" fill="#D85A30" opacity="0.45" />
        <circle cx="75" cy="62" r="6" fill="#D85A30" opacity="0.45" />
        {/* eyes (blink) */}
        <g className="mascot-eyes" fill="#1B4A30">
          <circle cx="50" cy="50" r="4.5" />
          <circle cx="70" cy="50" r="4.5" />
        </g>
        {/* smile */}
        <path
          d="M48 61 Q60 73 72 61"
          fill="none"
          stroke="#1B4A30"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* waving arm + hand */}
        <g className="mascot-hand">
          <line x1="90" y1="60" x2="103" y2="44" stroke="#E8983E" strokeWidth="5" strokeLinecap="round" />
          <circle cx="104" cy="42" r="7" fill="#F5C542" stroke="#E8983E" strokeWidth="2.5" />
        </g>
        {/* little heart */}
        <path
          d="M60 74 c-4 -5 -12 -1 -8 5 c2 3 8 6 8 6 c0 0 6 -3 8 -6 c4 -6 -4 -10 -8 -5 z"
          fill="#D85A30"
        />
      </svg>
    </div>
  )
}
