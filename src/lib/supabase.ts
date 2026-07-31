import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/db'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Confira o arquivo .env.local.',
  )
}

export const supabase = createClient<Database, 'public'>(supabaseUrl, supabaseAnonKey)
