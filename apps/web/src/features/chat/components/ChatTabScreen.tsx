
import React, { useState, useMemo } from 'react';
import { Persona, Screen } from '@qupid/core';
import { SearchIcon, SettingsIcon, PlusCircleIcon } from '@qupid/ui';
import { usePersonas } from '../../../shared/hooks/usePersonas';
import { useFavorites } from '../../../shared/hooks/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useGenerateDynamicPersonas } from '../hooks/useChatQueries';
import { useUserProfile } from '../../../shared/hooks/api/useUser';
import { getRandomAvatar } from '../../../shared/utils/avatarGenerator';
// 🚀 하드코딩된 페르소나 제거 - 동적 생성 시스템 사용

interface ChatTabScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectPersona?: (persona: Persona) => void;
}

const PersonaCard: React.FC<{ persona: Persona; onSelect: () => void; }> = ({ persona, onSelect }) => {
  return (
    <div 
        className="w-full p-4 flex bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-lg hover:border-[#F093B0] hover:-translate-y-0.5 cursor-pointer"
        onClick={onSelect}
    >
      <img src={persona.avatar} alt={persona.name} className="w-20 h-20 rounded-xl object-cover" />
      <div className="ml-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-[#191F28]">{persona.name}, {persona.age}</p>
                <p className="text-sm text-[#8B95A1] mt-0.5">{persona.job} · {persona.mbti}</p>
              </div>
              <p className="font-bold text-sm text-[#0AC5A8]">{persona.match_rate}% 맞음</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {persona.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-[#EBF2FF] text-[#4F7ABA] text-xs font-medium rounded-md">
                    #{tag}
                </span>
            ))}
          </div>
      </div>
    </div>
  );
};


const ChatTabScreen: React.FC<ChatTabScreenProps> = ({ onNavigate, onSelectPersona: onSelectPersonaProp }) => {
  const [searchQuery] = useState('');
  const [dynamicPersonas, setDynamicPersonas] = useState<any[]>([]);
  const [isGeneratingPersonas, setIsGeneratingPersonas] = useState(false);
  const [hasGeneratedPersonas, setHasGeneratedPersonas] = useState(false);
  const { currentUserId } = useAppStore();
  
  // API 호출
  const { data: apiPersonas = [], isLoading: isLoadingPersonas } = usePersonas();
  const { data: userProfile } = useUserProfile(currentUserId || '');
  const generateDynamicPersonasMutation = useGenerateDynamicPersonas();
  
  // 🚀 동적 페르소나 생성
  const generateNewPersonas = async () => {
    if (!userProfile || isGeneratingPersonas) return;
    
    setIsGeneratingPersonas(true);
    
    // 🚀 진짜 API 호출만 수행 - 즉시 fallback 제거
    
    try {
      const newPersonas = await generateDynamicPersonasMutation.mutateAsync({
        userProfile: {
          name: userProfile.name,
          age: 25,
          gender: userProfile.user_gender,
          job: '학생',
          interests: userProfile.interests || [],
          experience: userProfile.experience,
          mbti: 'ENFP',
          personality: ['친근함', '긍정적']
        },
        count: 6
      });
      
      setDynamicPersonas(newPersonas);
      setHasGeneratedPersonas(true);
      console.log('🎉 동적 페르소나로 업데이트 완료:', newPersonas.length, '개');
    } catch (error) {
      console.error('❌ 동적 페르소나 생성 실패:', error);
      console.log('⚠️ fallback 페르소나 유지');
    } finally {
      setIsGeneratingPersonas(false);
    }
  };
  
  // 🚀 수동 생성 방식으로 변경 - 자동 생성 로직 완전 제거
  
  // 🚀 동적 페르소나 우선 사용, 없으면 즉시 fallback 페르소나 표시
  const personas = dynamicPersonas.length > 0 ? dynamicPersonas : [
    {
      id: 'fallback-persona-1',
      name: '김민지',
      age: 24,
      gender: 'female',
      job: '디자이너',
      avatar: getRandomAvatar('female'),
      intro: '안녕하세요! 디자인을 좋아하는 민지예요 😊',
      tags: ['디자인', '예술', '창의적'],
      match_rate: 85,
      systemInstruction: '당신은 24세 디자이너 김민지입니다. 창의적이고 예술적인 대화를 좋아해요.',
      personality_traits: ['창의적', '감성적', '친근함'],
      interests: [
        { emoji: '🎨', topic: '디자인', description: '그래픽 디자인을 좋아해요' },
        { emoji: '📸', topic: '사진', description: '일상 사진 찍는 걸 좋아해요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 오늘 하루는 어땠나요? 😊' }
      ]
    },
    {
      id: 'fallback-persona-2',
      name: '박준호',
      age: 26,
      gender: 'male',
      job: '개발자',
      avatar: getRandomAvatar('male'),
      intro: '안녕하세요! 개발자 준호입니다 👨‍💻',
      tags: ['개발', '기술', '논리적'],
      match_rate: 82,
      systemInstruction: '당신은 26세 개발자 박준호입니다. 기술과 논리적인 대화를 선호해요.',
      personality_traits: ['논리적', '차분함', '친절함'],
      interests: [
        { emoji: '💻', topic: '프로그래밍', description: '새로운 기술을 배우는 걸 좋아해요' },
        { emoji: '🎮', topic: '게임', description: '스팀 게임을 즐겨해요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 어떤 일로 바쁘셨나요? 👋' }
      ]
    },
    {
      id: 'fallback-persona-3',
      name: '이서영',
      age: 23,
      gender: 'female',
      job: '학생',
      avatar: getRandomAvatar('female'),
      intro: '안녕하세요! 대학생 서영이에요 📚',
      tags: ['학습', '독서', '활발함'],
      match_rate: 88,
      systemInstruction: '당신은 23세 대학생 이서영입니다. 활발하고 호기심이 많아요.',
      personality_traits: ['활발함', '호기심', '친근함'],
      interests: [
        { emoji: '📚', topic: '독서', description: '소설과 에세이를 좋아해요' },
        { emoji: '🎵', topic: '음악', description: 'K-pop을 즐겨 들어요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 오늘 뭐 재밌는 일 있었어요? 😊' }
      ]
    },
    {
      id: 'fallback-persona-4',
      name: '최민수',
      age: 25,
      gender: 'male',
      job: '마케터',
      avatar: getRandomAvatar('male'),
      intro: '안녕하세요! 마케터 민수입니다 📈',
      tags: ['마케팅', '창의성', '소통'],
      match_rate: 79,
      systemInstruction: '당신은 25세 마케터 최민수입니다. 창의적이고 소통을 잘해요.',
      personality_traits: ['창의적', '소통', '적극적'],
      interests: [
        { emoji: '📱', topic: 'SNS', description: '인스타그램과 유튜브를 즐겨봐요' },
        { emoji: '🎬', topic: '영화', description: '드라마와 영화를 좋아해요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 오늘 하루는 어땠나요? 😄' }
      ]
    },
    {
      id: 'fallback-persona-5',
      name: '정수진',
      age: 22,
      gender: 'female',
      job: '학생',
      avatar: getRandomAvatar('female'),
      intro: '안녕하세요! 대학생 수진이에요 🎓',
      tags: ['학습', '예술', '감성적'],
      match_rate: 91,
      systemInstruction: '당신은 22세 대학생 정수진입니다. 감성적이고 예술을 좋아해요.',
      personality_traits: ['감성적', '예술적', '차분함'],
      interests: [
        { emoji: '🎨', topic: '그림', description: '수채화를 그리는 걸 좋아해요' },
        { emoji: '📚', topic: '시', description: '시집 읽는 걸 좋아해요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 오늘 날씨가 좋네요 😊' }
      ]
    },
    {
      id: 'fallback-persona-6',
      name: '한지훈',
      age: 27,
      gender: 'male',
      job: '요리사',
      avatar: getRandomAvatar('male'),
      intro: '안녕하세요! 요리사 지훈입니다 👨‍🍳',
      tags: ['요리', '음식', '창의성'],
      match_rate: 86,
      systemInstruction: '당신은 27세 요리사 한지훈입니다. 음식과 요리에 대한 열정이 있어요.',
      personality_traits: ['열정적', '창의적', '친근함'],
      interests: [
        { emoji: '🍳', topic: '요리', description: '새로운 레시피를 개발하는 걸 좋아해요' },
        { emoji: '🌱', topic: '원예', description: '허브를 기르는 걸 좋아해요' }
      ],
      conversation_preview: [
        { sender: 'ai', text: '안녕하세요! 오늘 뭐 맛있는 거 드셨나요? 😋' }
      ]
    }
  ];
  const { data: favoriteIds = [] } = useFavorites(currentUserId || '');
  
  // 임시 하드코딩 사용자 프로필 (추후 API 구현)
  const tempUserProfile = {
    user_gender: 'male' as const,
    partner_gender: 'female' as const,
    experience: 'beginner',
    interests: ['영화', '음악']
  };
  // const isLoadingProfile = false;
  
  // 즐겨찾기 페르소나 필터링
  const favoritePersonas = useMemo(() => {
    return personas.filter(p => favoriteIds.includes(p.id));
  }, [personas]);
  
  // 이성 페르소나만 필터링
  const filteredPersonas = useMemo(() => {
    const oppositeGender = tempUserProfile.partner_gender || (tempUserProfile.user_gender === 'male' ? 'female' : 'male');
    return personas.filter(p => p.gender === oppositeGender);
  }, [personas]);
  
  // 검색 필터링
  const searchedPersonas = useMemo(() => {
    if (!searchQuery) return filteredPersonas;
    const query = searchQuery.toLowerCase();
    return filteredPersonas.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.job?.toLowerCase().includes(query) ||
      p.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [filteredPersonas, searchQuery]);
  const onSelectPersona = (persona: Persona) => {
    if (onSelectPersonaProp) {
      onSelectPersonaProp(persona);
    } else {
      onNavigate(Screen.ConversationPrep);
    }
  };

  const getConsiderations = () => {
    if (!tempUserProfile) return [];
    const considerations = [];
    if (tempUserProfile.experience === '없음' || tempUserProfile.experience === '1-2회') {
      considerations.push('연애 초보자를 위한 친근한 성격');
    }
    if (tempUserProfile.interests && tempUserProfile.interests.length > 0) {
      considerations.push(`${tempUserProfile.interests[0].replace(/🎮|🎬|💪|✈️|🍕|📚|🎵|🎨|📱|🐕|☕|📷|🏖️|🎪|💼\s/g, '')} 등 공통 관심사 보유`);
    }
    return considerations;
  }
  const considerations = getConsiderations();


  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#191F28]">👥 나의 AI 친구들</h1>
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><SearchIcon className="w-6 h-6 text-[#191F28]" /></button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><SettingsIcon className="w-6 h-6 text-[#191F28]" /></button>
            </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Favorites Section */}
        {favoritePersonas.length > 0 && (
          <section>
              <h2 className="text-lg font-bold text-[#191F28] mb-3 px-1">⭐ 즐겨찾는 AI</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {favoritePersonas.map((p, index) => (
                      <div 
                        key={p.id} 
                        onClick={() => onSelectPersona(p)} 
                        className="flex-shrink-0 w-20 text-center cursor-pointer transition-transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                          <div className="relative">
                              <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full object-cover"/>
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0AC5A8] rounded-full border-2 border-white"></div>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold truncate">{p.name}</p>
                      </div>
                  ))}
              </div>
          </section>
        )}
        
        {/* 🚀 카테고리별 AI 친구 섹션 */}
        <section className="space-y-4">
            {/* 💕 연애 연습용 */}
            <div className="p-4 bg-gradient-to-r from-[#FDF2F8] to-[#FCE7F3] rounded-xl">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-[#191F28]">💕 연애 연습용</h2>
                    <button 
                      onClick={() => {
                        console.log('💕 연애 연습용 페르소나 생성 요청');
                        // TODO: 연애 연습용 페르소나 생성 API 호출
                        onNavigate(Screen.CustomPersona);
                      }}
                      disabled={isGeneratingPersonas}
                      className="px-3 py-1 text-xs font-bold text-white rounded-full transition-all hover:scale-105 disabled:opacity-50"
                      style={{backgroundColor: '#F093B0'}}
                    >
                      {isGeneratingPersonas ? '생성 중...' : '+ 새로 만들기'}
                    </button>
                </div>
                <p className="text-sm text-[#4F7ABA]">
                  연애 상황에서의 대화를 연습해보세요
                </p>
            </div>

            {/* 🎯 직장 대화용 */}
            <div className="p-4 bg-gradient-to-r from-[#EBF2FF] to-[#DBEAFE] rounded-xl">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-[#191F28]">🎯 직장 대화용</h2>
                    <button 
                      onClick={() => {
                        console.log('🎯 직장 대화용 페르소나 생성 요청');
                        // TODO: 직장 대화용 페르소나 생성 API 호출
                        onNavigate(Screen.CustomPersona);
                      }}
                      disabled={isGeneratingPersonas}
                      className="px-3 py-1 text-xs font-bold text-white rounded-full transition-all hover:scale-105 disabled:opacity-50"
                      style={{backgroundColor: '#0AC5A8'}}
                    >
                      {isGeneratingPersonas ? '생성 중...' : '+ 새로 만들기'}
                    </button>
                </div>
                <p className="text-sm text-[#4F7ABA]">
                  직장에서의 소통 스킬을 향상시켜보세요
                </p>
            </div>

            {/* 🎨 취미 공유용 */}
            <div className="p-4 bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] rounded-xl">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-[#191F28]">🎨 취미 공유용</h2>
                    <button 
                      onClick={() => {
                        console.log('🎨 취미 공유용 페르소나 생성 요청');
                        // TODO: 취미 공유용 페르소나 생성 API 호출
                        onNavigate(Screen.CustomPersona);
                      }}
                      disabled={isGeneratingPersonas}
                      className="px-3 py-1 text-xs font-bold text-white rounded-full transition-all hover:scale-105 disabled:opacity-50"
                      style={{backgroundColor: '#22C55E'}}
                    >
                      {isGeneratingPersonas ? '생성 중...' : '+ 새로 만들기'}
                    </button>
                </div>
                <p className="text-sm text-[#4F7ABA]">
                  공통 관심사를 나누며 자연스러운 대화를 연습해보세요
                </p>
            </div>
           {/* 🚀 전체 AI 친구 목록 - 1명씩 오른쪽 슬라이드 형태 */}
           <div className="p-4 bg-white rounded-xl border border-[#F2F4F6]">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-base">👥 전체 AI 친구들</h3>
                   <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-500">{searchedPersonas.length}명</span>
                       <button 
                           onClick={() => {
                               console.log('🔄 AI 친구 새로고침 요청');
                               generateNewPersonas();
                           }}
                           disabled={isGeneratingPersonas}
                           className="p-1 text-[#F093B0] hover:bg-[#FDF2F8] rounded-full transition-all disabled:opacity-50"
                           title="새로운 AI 친구 생성"
                       >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                       </button>
                   </div>
               </div>
               
               {isLoadingPersonas || isGeneratingPersonas ? (
                   <div className="flex flex-col justify-center items-center py-8">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AC5A8] mb-3"></div>
                       <p className="text-sm text-gray-500">
                           {isGeneratingPersonas ? 'AI가 맞춤 친구들을 만들고 있어요...' : '페르소나를 불러오는 중...'}
                       </p>
                   </div>
               ) : searchedPersonas.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-8">
                       <div className="text-4xl mb-3">🤖✨</div>
                       <h4 className="font-bold text-base mb-2">아직 AI 친구가 없어요!</h4>
                       <p className="text-sm text-gray-500 text-center mb-4">
                           위의 카테고리에서<br/>
                           새로운 AI 친구를 만들어보세요
                       </p>
                   </div>
               ) : (
                   <div className="relative">
                       {/* 🚀 1명씩 오른쪽 슬라이드 형태 */}
                       <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                           {searchedPersonas.slice(0, 1).map((persona, i) => (
                               <div 
                                   key={persona.id} 
                                   className="flex-shrink-0 w-full animate-fade-in-up p-4 bg-white rounded-xl border border-[#F2F4F6] hover:border-[#F093B0] hover:shadow-lg transition-all cursor-pointer group"
                                   style={{ animationDelay: `${i * 100}ms` }}
                                   onClick={() => onSelectPersona(persona)}
                               >
                                   {/* 🚀 카드 형태 AI 친구 - 가로형 */}
                                   <div className="flex items-center">
                                       <div className="relative w-16 h-16 mr-4">
                                           <img 
                                               src={persona.avatar} 
                                               alt={persona.name} 
                                               className="w-full h-full rounded-full object-cover border-2 border-white group-hover:border-[#F093B0] transition-colors" 
                                           />
                                           <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0AC5A8] rounded-full border-2 border-white flex items-center justify-center">
                                               <span className="text-xs font-bold text-white">{persona.match_rate}%</span>
                                           </div>
                                       </div>
                                       
                                       <div className="flex-1">
                                           <h3 className="font-bold text-base mb-1 text-[#191F28]">{persona.name}</h3>
                                           <p className="text-xs text-gray-600 mb-2">{persona.age}세 • {persona.job}</p>
                                           
                                           <div className="flex flex-wrap gap-1 mb-2">
                                               {persona.tags?.slice(0, 2).map((tag: string, tagIndex: number) => (
                                                   <span key={tagIndex} className="px-2 py-1 text-xs bg-[#F093B0] text-white rounded-full">
                                                       {tag}
                                                   </span>
                                               ))}
                                           </div>
                                           
                                           <div className="text-xs text-gray-500 mb-3 line-clamp-2">
                                               {persona.intro?.length > 60 ? `${persona.intro.substring(0, 60)}...` : persona.intro}
                                           </div>
                                       </div>
                                       
                                       <button className="ml-4 py-2 px-4 text-sm font-bold text-white rounded-lg transition-all hover:scale-105 bg-[#F093B0]">
                                           대화하기
                                       </button>
                                   </div>
                               </div>
                           ))}
                           
                           {/* 🚀 더 많은 AI 친구가 있을 때 슬라이드 표시 */}
                           {searchedPersonas.length > 1 && (
                               <div className="flex-shrink-0 w-full flex items-center justify-center">
                                   <div className="text-center p-4">
                                       <div className="text-2xl mb-2">👥</div>
                                       <p className="text-sm text-gray-500 mb-2">
                                           {searchedPersonas.length - 1}명의<br/>더 많은 AI 친구들
                                       </p>
                                       <button 
                                           onClick={() => {
                                               console.log('🔄 다음 AI 친구 보기');
                                               // TODO: 다음 AI 친구로 슬라이드
                                           }}
                                           className="px-3 py-1 text-xs font-bold text-[#F093B0] border border-[#F093B0] rounded-full hover:bg-[#FDF2F8] transition-all"
                                       >
                                           다음 보기
                                       </button>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
        </section>

        <section>
          <button onClick={() => onNavigate(Screen.CustomPersona)} className="w-full p-4 bg-white rounded-2xl border border-dashed border-[#B794F6] flex items-center justify-center text-[#B794F6] font-bold hover:bg-[#F7F4FF] transition-all hover:shadow-md hover:border-[#9B7FE5]">
            <PlusCircleIcon className="w-6 h-6 mr-2" />
            나만의 AI 만들기
          </button>
        </section>
      </main>
    </div>
  );
};

export { ChatTabScreen };
export default ChatTabScreen;
