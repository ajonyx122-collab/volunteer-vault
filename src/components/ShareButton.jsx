'use client'

import { useState } from 'react'

// Native share sheet on phones, copy-link fallback everywhere else.
export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked; nothing else to do
    }
  }

  return (
    <button onClick={share} className="text-sm font-bold text-coral hover:underline">
      {copied ? '✓ Link copied' : 'Share this page ↗'}
    </button>
  )
}
