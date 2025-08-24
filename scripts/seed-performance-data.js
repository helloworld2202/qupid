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

async function seedPerformanceData() {
  try {
    console.log('🚀 Starting performance data seeding...');
    
    // 실제 존재하는 사용자 ID 사용 (가장 최근에 생성된 사용자)
    const userId = 'a6d4ac3f-b8cf-41eb-b744-0279b12ea192';
    const now = new Date();
    
    // 1. Create conversations for this week
    const conversations = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: userId,
        partner_type: 'persona',
        partner_id: 'persona_1',
        started_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        user_id: userId,
        partner_type: 'persona',
        partner_id: 'persona_2',
        started_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 32 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        user_id: userId,
        partner_type: 'persona',
        partner_id: 'persona_3',
        started_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        user_id: userId,
        partner_type: 'coach',
        partner_id: 'coach_1',
        started_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('📝 Inserting conversations...');
    const { error: convError } = await supabase
      .from('conversations')
      .upsert(conversations, { onConflict: 'id' });
    
    if (convError) {
      console.error('Error inserting conversations:', convError);
    } else {
      console.log('✅ Conversations inserted');
    }
    
    // 2. Create conversation analysis
    const analyses = [
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440001',
        overall_score: 75,
        affinity_score: 80,
        improvements: ['더 자주 질문하기', '상대방 말에 리액션 보이기'],
        achievements: ['적극적인 대화 참여', '친근한 어투 사용'],
        tips: ['오픈 엔디드 질문을 활용해보세요'],
        analyzed_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440002',
        overall_score: 82,
        affinity_score: 85,
        improvements: ['유머 감각 향상'],
        achievements: ['공감 능력 우수', '대화 리드'],
        tips: ['상대방의 취미에 대해 물어보세요'],
        analyzed_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440003',
        overall_score: 88,
        affinity_score: 90,
        improvements: [],
        achievements: ['완벽한 대화 흐름', '높은 친밀도 형성'],
        tips: ['계속 이대로 하시면 됩니다!'],
        analyzed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        conversation_id: '550e8400-e29b-41d4-a716-446655440004',
        overall_score: 92,
        affinity_score: 95,
        improvements: [],
        achievements: ['뛰어난 유머 감각', '자연스러운 대화 전환'],
        tips: [],
        analyzed_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('📊 Inserting conversation analyses...');
    const { error: analysisError } = await supabase
      .from('conversation_analysis')
      .upsert(analyses, { onConflict: 'conversation_id' });
    
    if (analysisError) {
      console.error('Error inserting analyses:', analysisError);
    } else {
      console.log('✅ Conversation analyses inserted');
    }
    
    // 3. Create performance metrics
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const metrics = {
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      weekly_score: 84,
      daily_scores: [75, 0, 82, 0, 88, 92, 0],
      category_scores: {
        친근함: 85,
        호기심: 92,
        공감력: 78,
        유머: 72,
        배려: 80,
        적극성: 75
      },
      total_time_minutes: 103,
      session_count: 4
    };
    
    console.log('📈 Inserting performance metrics...');
    const { error: metricsError } = await supabase
      .from('performance_metrics')
      .upsert(metrics, { onConflict: 'user_id,week_start' });
    
    if (metricsError) {
      console.error('Error inserting metrics:', metricsError);
    } else {
      console.log('✅ Performance metrics inserted');
    }
    
    // 4. Add some sample messages
    const messages = [];
    const messageTexts = [
      { user: '안녕하세요! 오늘 날씨가 좋네요', ai: '네 정말 좋아요! 이런 날엔 산책하기 딱이죠' },
      { user: '맞아요, 혹시 좋아하는 산책 코스가 있나요?', ai: '한강공원을 자주 가요. 특히 저녁 노을이 예쁘거든요' },
      { user: '저도 한강 좋아해요! 어느 쪽을 자주 가시나요?', ai: '여의도 쪽이요! 벚꽃 시즌엔 정말 예뻐요' }
    ];
    
    conversations.forEach(conv => {
      messageTexts.forEach((msg, idx) => {
        messages.push({
          conversation_id: conv.id,
          sender_type: 'user',
          content: msg.user,
          timestamp: new Date(new Date(conv.started_at).getTime() + idx * 4 * 60 * 1000).toISOString()
        });
        messages.push({
          conversation_id: conv.id,
          sender_type: 'ai',
          content: msg.ai,
          timestamp: new Date(new Date(conv.started_at).getTime() + idx * 4 * 60 * 1000 + 60 * 1000).toISOString()
        });
      });
    });
    
    console.log('💬 Inserting messages...');
    const { error: msgError } = await supabase
      .from('messages')
      .upsert(messages);
    
    if (msgError) {
      console.error('Error inserting messages:', msgError);
    } else {
      console.log('✅ Messages inserted');
    }
    
    console.log('\n🎉 Performance data seeding completed successfully!');
    console.log('📱 You can now check the app to see the real performance data');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedPerformanceData();