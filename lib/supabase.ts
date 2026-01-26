import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (supabase) return supabase
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  supabase = createClient(url, key)
  return supabase
}
