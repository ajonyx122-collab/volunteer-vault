'use client'

import { useEffect, useState } from 'react'

// Both panels are rendered up front (the nonprofits one server-side, for
// SEO) and just shown/hidden, so switching tabs is instant.
export default function StudentLedTabs({ initialTab, nonprofitCount, nonprofits, projects }) {
  const [tab, setTab] = useState(initialTab === 'projects' ? 'projects' : 'nonprofits')
  // Follow ?tab= when a link on this page (e.g. the hero's "Browse projects") changes it.
  useEffect(() => setTab(initialTab === 'projects' ? 'projects' : 'nonprofits'), [initialTab])

  const tabs = [
    { id: 'nonprofits', icon: '🎓', label: 'Student Nonprofits', sub: `${nonprofitCount} founded by students` },
    { id: 'projects', icon: '🌱', label: 'Projects', sub: 'One-time, posted by anyone' },
  ]

  function select(id) {
    setTab(id)
    const url = id === 'nonprofits' ? '/student-led' : '/student-led?tab=projects'
    window.history.replaceState(null, '', url)
  }

  return (
    <>
      {/* Chunky two-up switch, overlapping the hero's bottom edge */}
      <div
        role="tablist"
        className="relative -mt-7 grid grid-cols-2 gap-2 rounded-card border-2 border-brand-green bg-card p-1.5 shadow-pop-soft"
      >
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => select(t.id)}
              className={`flex items-center justify-center gap-2 rounded-[12px] px-2 py-3 text-left transition-all sm:gap-3 sm:px-4 ${
                active ? 'bg-brand-green text-cream-text shadow-pop' : 'text-brand-green hover:bg-cream'
              }`}
            >
              <span className={`text-2xl transition-transform sm:text-3xl ${active ? 'scale-110' : ''}`} aria-hidden>
                {t.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-extrabold leading-tight sm:text-base">{t.label}</span>
                <span className={`hidden text-xs sm:block ${active ? 'text-cream-muted' : 'text-brand-green/50'}`}>{t.sub}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className={tab === 'nonprofits' ? '' : 'hidden'}>
        {nonprofits}
      </div>
      <div role="tabpanel" className={tab === 'projects' ? 'pt-2' : 'hidden'}>
        {projects}
      </div>
    </>
  )
}
