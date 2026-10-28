import { createClient } from '@supabase/supabase-js'

// Anon key only: the browser uses Supabase for login; all data goes through our backend.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
