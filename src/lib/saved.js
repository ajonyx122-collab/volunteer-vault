'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// The ❤️ "saved for later" list. Saving needs an account, so the list lives in
// the saved_opportunities table (migration 051) and follows you across
// devices. A module-level cache + custom event keeps every heart on the page in
// sync without each one hitting the database. AuthContext calls loadSaved()
// on login and clearSaved() on logout.
const EVENT = 'vv-saved-change'
// Pre-accounts saves were kept in the browser under this key; they're moved
// into the account the first time someone logs in on that device.
const LEGACY_KEY = 'vv_saved'

let cache = []
let cacheUserId = null

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    /* ignore */
  }
}

function takeLegacyIds() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    localStorage.removeItem(LEGACY_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export async function loadSaved(userId) {
  cacheUserId = userId
  const legacy = takeLegacyIds()
  if (legacy.length) {
    await supabase
      .from('saved_opportunities')
      .upsert(
        legacy.map((id) => ({ user_id: userId, opportunity_id: id })),
        { onConflict: 'user_id,opportunity_id', ignoreDuplicates: true },
      )
  }
  const { data } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', userId)
  if (cacheUserId !== userId) return // logged out / switched while loading
  cache = (data ?? []).map((r) => r.opportunity_id)
  emit()
}

export function clearSaved() {
  cacheUserId = null
  cache = []
  emit()
}

export function getSavedIds() {
  return cache
}

// Optimistic toggle; rolls back if the database write fails. Returns the new
// saved state.
export async function toggleSaved(id, userId) {
  const wasSaved = cache.includes(id)
  cache = wasSaved ? cache.filter((x) => x !== id) : [...cache, id]
  emit()
  const { error } = wasSaved
    ? await supabase.from('saved_opportunities').delete().eq('user_id', userId).eq('opportunity_id', id)
    : await supabase.from('saved_opportunities').insert({ user_id: userId, opportunity_id: id })
  if (error) {
    cache = wasSaved ? [...cache, id] : cache.filter((x) => x !== id)
    emit()
    return wasSaved
  }
  return !wasSaved
}

// Live list of saved ids that re-renders whenever the saved set changes.
export function useSavedIds() {
  const [ids, setIds] = useState([])
  useEffect(() => {
    const sync = () => setIds(getSavedIds())
    sync()
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  return ids
}
