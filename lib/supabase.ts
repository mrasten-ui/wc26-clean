import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ✅ SINGLETON: This ensures the whole app shares the SAME session state
export const supabase = createClient(supabaseUrl, supabaseKey);