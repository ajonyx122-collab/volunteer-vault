'use client'

import { useState } from 'react'

const TABS = [
  { id: 'nonprofits', label: '🎓 Student Nonprofits' },
  { id: 'projects', label: '🌱 Projects' },
]

// Both panels are rendered up front (the nonprofits one server-side, for
// SEO) and just shown/hidden, so switching tabs is instant.
export default function StudentLedTabs({ initialTab, nonprofits, projects }) {
  const [tab, setTab] = useState(initialTab === 'projects' ? 'projects' : 'nonprofits')

  function select(id) {
    setTab(id)
    const url = id === 'nonprofits' ? '/student-led' : '/student-led?tab=projects'
    window.history.replaceState(null, '', url)
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={`rounded-pill px-5 py-2 text-sm font-bold transition-colors ${
              tab === t.id ? 'bg-brand-green text-cream-text' : 'border border-card-border bg-card text-brand-green hover:bg-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={tab === 'nonprofits' ? '' : 'hidden'}>{nonprofits}</div>
      <div className={tab === 'projects' ? '' : 'hidden'}>{projects}</div>
    </>
  )
}
