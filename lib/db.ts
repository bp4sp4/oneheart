import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These environment variables must be set in your .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceKey) {
  throw new Error("Missing env.SUPABASE_SERVICE_KEY");
}

// Create a single, shared Supabase client for the server-side
export const supabase = createClient(supabaseUrl, supabaseServiceKey);