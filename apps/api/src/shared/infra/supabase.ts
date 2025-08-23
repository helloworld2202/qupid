import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import type { Database } from '@qupid/core';

// Service role client for server-side operations with full access
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
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
  env.SUPABASE_ANON_KEY
);