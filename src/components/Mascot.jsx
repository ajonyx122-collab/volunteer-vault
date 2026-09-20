'use client'

import { useEffect, useState } from 'react'

// "Sunny" — a friendly sun buddy who lives in the corner and hands out
// volunteering tips. Tap to get a new one (it also rotates on its own). Fixed
// to its own corner so it never crowds the page; desktop only so it can't
// cover content on phones.
const TIPS = [
  '🌱 Online roles count for service hours too!',
  '🤍 Tap the heart on a listing to save it for later.',
  '🔥 Log hours each week to keep your streak alive.',
  "🎲 Not sure where to start? Try Surprise Me — I'll pick one!",
  "📅 Log your hours right after you serve so you don't forget.",
  "🤝 Bring a friend — you're way more likely to show up together.",
  '🏅 Every few hours unlocks a new badge. Keep going!',
  '🌍 One hour a week adds up to 50+ hours a year.',
  '📝 Leave a review afterward to help the next volunteer.',
  '🔒 Your verified hours live in a shareable vault — great for college apps.',
  '🍂 Log hours this fall to collect the whole seasonal set!',
  '❤️ Pick a cause you love — you\'ll stick with it longer.',
]

export default function Mascot() {
  const [tip, setTip] = useState(0)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 6000)
    return () => clearInterval(id)
  }, [])

  function nextTip() {
    setTip((t) => (t + 1) % TIPS.length)
    setBounce(true)
    setTimeout(() => setBounce(false), 400)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden select-none flex-col items-end lg:flex">
      <div
        key={tip}
        className="mb-2 max-w-[16rem] rounded-card rounded-br-sm border border-card-border bg-card px-3 py-2 text-right text-xs font-bold text-brand-green shadow-pop"
      >
        {TIPS[tip]}
      </div>
      <button
        onClick={nextTip}
        aria-label="Sunny the mascot — tap for a volunteering tip"
        title="Tap me for a tip!"
        className={`transition-transform hover:scale-105 ${bounce ? 'scale-110' : ''}`}
      >
        <svg width="112" height="112" viewBox="0 0 120 120" className="animate-floaty drop-shadow-md" aria-hidden>
          {/* rays — coords rounded so SSR and client render identical strings */}
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
          <circle cx="60" cy="55" r="34" fill="#F5C542" stroke="#E8983E" strokeWidth="3" />
          <circle cx="45" cy="62" r="6" fill="#D85A30" opacity="0.45" />
          <circle cx="75" cy="62" r="6" fill="#D85A30" opacity="0.45" />
          <g className="mascot-eyes" fill="#1B4A30">
            <circle cx="50" cy="50" r="4.5" />
            <circle cx="70" cy="50" r="4.5" />
          </g>
          <path d="M48 61 Q60 73 72 61" fill="none" stroke="#1B4A30" strokeWidth="3.5" strokeLinecap="round" />
          <g className="mascot-hand">
            <line x1="90" y1="60" x2="103" y2="44" stroke="#E8983E" strokeWidth="5" strokeLinecap="round" />
            <circle cx="104" cy="42" r="7" fill="#F5C542" stroke="#E8983E" strokeWidth="2.5" />
          </g>
          <path
            d="M60 74 c-4 -5 -12 -1 -8 5 c2 3 8 6 8 6 c0 0 6 -3 8 -6 c4 -6 -4 -10 -8 -5 z"
            fill="#D85A30"
          />
        </svg>
      </button>
    </div>
  )
}
