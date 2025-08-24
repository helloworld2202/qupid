#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...\n');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('💡 Please sign up first in the app to create a user');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Created: ${new Date(user.created_at).toLocaleString()}\n`);
    });
    
    console.log('📝 Use one of these user IDs in the seed script');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();