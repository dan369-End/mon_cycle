
import { createClient } from '@supabase/supabase-js';

// Priorité aux variables d'environnement, avec fallback sur les identifiants du projet
const supabaseUrl = (process.env.VITE_SUPABASE_URL || 'https://ybaddmzsigdsojejuiwd.supabase.co') as string;
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BEHHNhl_Y0TAYPlJ9htQnw_bC0c6vhh') as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: globalThis.fetch.bind(globalThis),
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
