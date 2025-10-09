import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';
import { useGeneratePersona } from '../../../shared/hooks/usePersonaGeneration';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useUserProfile } from '../../../shared/hooks/api/useUser';

interface CustomPersonaFormProps {
  onCreate?: (persona: any) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

const CustomPersonaForm: React.FC<CustomPersonaFormProps> = ({ onCreate, onBack, onCancel }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const generatePersona = useGeneratePersona();
  const { currentUserId } = useAppStore();
  const { data: userProfile } = useUserProfile(currentUserId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && !isGenerating) {
      setIsGenerating(true);
      
      try {
        console.log('🚀 사용자 정의 페르소나 생성 시작:', description);
        
        // AI로 페르소나 생성
        const persona = await generatePersona.mutateAsync({
          userGender: userProfile?.user_gender || 'male',
          userInterests: [description], // 사용자 설명을 관심사로 활용
          isTutorial: false
        });
        
        console.log('✅ 사용자 정의 페르소나 생성 성공:', persona);
        
        // 생성된 페르소나를 부모 컴포넌트로 전달
        onCreate?.(persona);
      } catch (error) {
        console.error('❌ 페르소나 생성 실패:', error);
        
        // 실패 시 기본 페르소나 생성
        const partnerGender = userProfile?.user_gender === 'male' ? 'female' : 'male';
        const fallbackPersona = {
          id: `custom-persona-${Date.now()}`,
          name: partnerGender === 'female' ? '이서영' : '최민수',
          age: 26,
          gender: partnerGender,
          avatar: partnerGender === 'female' 
            ? 'https://avatar.iran.liara.run/public/girl?username=SeoYoungLee'
            : 'https://avatar.iran.liara.run/public/boy?username=MinSooChoi',
          job: '프리랜서',
          mbti: 'ENFJ',
          intro: description.length > 100 ? `${description.substring(0, 100)}...` : description,
          system_instruction: `당신은 사용자가 요청한 특성을 가진 사람입니다: ${description}`,
          tags: ['맞춤형', '특별함', '대화'],
          match_rate: 90,
          personality_traits: ['친근함', '이해심', '배려'],
          interests: [
            { emoji: '✨', topic: '맞춤 대화', description: description.substring(0, 50) }
          ],
          conversation_preview: [
            { sender: 'ai', text: '안녕하세요! 반갑습니다 😊' }
          ]
        };
        
        console.log('🔄 생성된 fallback 페르소나:', fallbackPersona);
        onCreate?.(fallbackPersona);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full animate-back-out" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex-shrink-0 flex items-center p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onBack || onCancel} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeftIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }}/>
        </button>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>나만의 이상형 만들기</h2>
      </header>

      <div className="flex-grow flex flex-col p-6">
        <p className="mb-4 text-base" style={{ color: 'var(--text-secondary)' }}>
          대화하고 싶은 이상형의 특징을 자유롭게 작성해주세요.
          <br />
          <span className="text-sm">(예: 30대 초반의 다정한 사업가, 동물을 좋아하고 여행을 즐김)</span>
        </p>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="성격, 나이, 직업, 취미, 가치관 등을 상세히 적을수록 더 현실적인 AI가 만들어져요."
            className="w-full flex-grow p-4 border rounded-xl focus:outline-none focus:ring-2 resize-none text-base"
            style={{ 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)', 
              backgroundColor: 'var(--background)',
              '--tw-ring-color': 'var(--secondary-blue-main)'
            } as React.CSSProperties}
            rows={10}
          />
          <button
            type="submit"
            disabled={!description.trim() || isGenerating}
            className="w-full mt-6 text-white font-semibold text-lg py-4 px-4 rounded-xl transition-opacity disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
            style={{ 
                backgroundColor: 'var(--primary-pink-main)',
            }}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                AI가 이상형을 만들고 있어요...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                이상형과 대화 시작하기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export { CustomPersonaForm };
export default CustomPersonaForm;