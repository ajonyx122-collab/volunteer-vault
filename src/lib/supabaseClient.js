import { createClient } from '@supabase/supabase-js'

// Keys live in .env.local (gitignored). The anon key is safe for the browser —
// row-level security in the database is what protects the data.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
