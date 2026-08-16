import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Jika env belum dikonfigurasi, aplikasi berjalan dalam mode lokal (localStorage).
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isOnlineConfigured = Boolean(supabase)
