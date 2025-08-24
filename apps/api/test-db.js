// 데이터베이스 연결 테스트 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 새로운 키 이름 사용
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Using Secret/Service Key:', secretKey?.substring(0, 20) + '...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'apikey': secretKey,
        'Authorization': `Bearer ${secretKey}`
      }
    }
  }
);

async function testDatabase() {
  console.log('Testing database connection...\n');
  
  // 1. personas 테이블 테스트
  console.log('1. Testing personas table:');
  const { data: personas, error: personasError } = await supabase
    .from('personas')
    .select('*');
  
  if (personasError) {
    console.error('Error fetching personas:', personasError);
  } else {
    console.log(`Found ${personas?.length || 0} personas`);
    if (personas?.length > 0) {
      console.log('Sample persona:', personas[0]);
    }
  }
  
  // 2. coaches 테이블 테스트
  console.log('\n2. Testing coaches table:');
  const { data: coaches, error: coachesError } = await supabase
    .from('coaches')
    .select('*');
  
  if (coachesError) {
    console.error('Error fetching coaches:', coachesError);
  } else {
    console.log(`Found ${coaches?.length || 0} coaches`);
    if (coaches?.length > 0) {
      console.log('Sample coach:', coaches[0]);
    }
  }
  
  // 3. badges 테이블 테스트
  console.log('\n3. Testing badges table:');
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('*');
  
  if (badgesError) {
    console.error('Error fetching badges:', badgesError);
  } else {
    console.log(`Found ${badges?.length || 0} badges`);
    if (badges?.length > 0) {
      console.log('Sample badge:', badges[0]);
    }
  }
  
  // 4. users 테이블 테스트
  console.log('\n4. Testing users table:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log(`Found ${users?.length || 0} users`);
    if (users?.length > 0) {
      console.log('Sample user:', users[0]);
    }
  }
}

testDatabase().catch(console.error);