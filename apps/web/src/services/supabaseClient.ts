
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'));

// Use placeholder credentials if the environment variables are not set.
// This prevents the app from crashing on startup, but database functionality will be unavailable.
const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalSupabaseKey = supabaseKey || 'placeholder';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials are not set in environment variables. " +
    "Using placeholder values. The app's database functionality will be disabled. " +
    "Please provide SUPABASE_URL and SUPABASE_KEY."
  );
}

export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseKey, {
  auth: {
    // In a web app, it's recommended to use localStorage for session persistence.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});