import { createClient } from '@supabase/supabase-js'

// The anon key is safe to ship in the browser bundle — every visitor receives
// it by design, and row-level security in the database is what protects the
// data. Env vars (if set) still win, so a future key rotation only needs a
// Vercel env change.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcbxdgumjckrpirnesux.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYnhkZ3VtamNrcnBpcm5lc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDk2MDQsImV4cCI6MjA5OTAyNTYwNH0.PX49FFJ6UvTVD3oSQoZg1wyGZ_z2UAmG3jkaiNZg4E4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
