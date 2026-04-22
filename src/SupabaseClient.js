import { createClient } from '@supabase/supabase-js'

// O Vite exige o uso de import.meta.env para acessar o .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)