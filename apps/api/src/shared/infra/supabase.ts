import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import type { Database } from '@qupid/core';

// Service role client for server-side operations with full access
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
const anonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;

if (!serviceRoleKey || !anonKey) {
  throw new Error('Missing required Supabase keys. Please check your environment variables.');
}

export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Anon client for operations that respect RLS
export const supabaseClient = createClient<Database>(
  env.SUPABASE_URL,
  anonKey
);