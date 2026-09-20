'use client'

import { useEffect, useState } from 'react'

// Per-device "saved for later" list, kept in localStorage so it works with no
// login. All reads/writes are wrapped in try/catch (private mode, blocked
// storage, SSR) and a custom event keeps every heart on the page in sync.
const KEY = 'vv_saved'
const EVENT = 'vv-saved-change'

export function getSavedIds() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function toggleSaved(id) {
  const ids = getSavedIds()
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    /* ignore */
  }
  return next.includes(id)
}

// Live list of saved ids that re-renders when anything on the page (or another
// tab) changes the saved set.
export function useSavedIds() {
  const [ids, setIds] = useState([])
  useEffect(() => {
    const sync = () => setIds(getSavedIds())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return ids
}
