import { createClient } from '@supabase/supabase-js'

// Server-side counterpart to lib/supabaseClient.js — same anon key, same
// RLS-enforced access, just invoked from a Server Component's request
// instead of the browser. No cookie/session forwarding: every page that
// reads through this client only ever fetches public, RLS-readable data
// (opportunities, orgs, reviews) — nothing gated behind a logged-in user.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcbxdgumjckrpirnesux.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYnhkZ3VtamNrcnBpcm5lc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDk2MDQsImV4cCI6MjA5OTAyNTYwNH0.PX49FFJ6UvTVD3oSQoZg1wyGZ_z2UAmG3jkaiNZg4E4'

export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
}
