import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';
import { useGeneratePersona } from '../../../shared/hooks/usePersonaGeneration';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useUserProfile } from '../../../shared/hooks/api/useUser';
import { getRandomAvatar } from '../../../shared/utils/avatarGenerator';
// 🚀 카테고리별 페르소나 속성 정의
const PERSONA_ATTRIBUTES = {
    dating: {
        title: '연애 연습용 AI',
        description: '연애 상황에서의 대화를 연습해보세요',
        personalities: [
            { id: 'romantic', name: '로맨틱한', description: '달콤하고 로맨틱한 대화를 좋아해요' },
            { id: 'cheerful', name: '밝고 긍정적인', description: '항상 밝고 긍정적인 에너지를 가져요' },
            { id: 'mysterious', name: '신비로운', description: '약간의 신비로움과 매력을 가져요' },
            { id: 'caring', name: '배려심 많은', description: '상대방을 세심하게 배려해요' }
        ],
        ages: [
            { id: '20s', name: '20대', description: '20-29세' },
            { id: '30s', name: '30대', description: '30-39세' },
            { id: '40s', name: '40대', description: '40-49세' }
        ],
        jobs: [
            { id: 'designer', name: '디자이너', description: '창의적인 디자인 작업을 해요' },
            { id: 'marketer', name: '마케터', description: '브랜드와 제품을 홍보해요' },
            { id: 'teacher', name: '교사', description: '학생들을 가르치고 있어요' },
            { id: 'entrepreneur', name: '사업가', description: '자신만의 사업을 운영해요' }
        ],
        hobbies: [
            { id: 'travel', name: '여행', description: '새로운 곳을 탐험하는 걸 좋아해요' },
            { id: 'cooking', name: '요리', description: '맛있는 음식을 만드는 걸 즐겨요' },
            { id: 'music', name: '음악', description: '다양한 장르의 음악을 좋아해요' },
            { id: 'art', name: '예술', description: '그림 그리기나 전시 관람을 좋아해요' }
        ]
    },
    work: {
        title: '직장 대화용 AI',
        description: '직장에서의 소통 스킬을 향상시켜보세요',
        personalities: [
            { id: 'professional', name: '전문적인', description: '업무에 대한 전문성을 보여줘요' },
            { id: 'collaborative', name: '협력적인', description: '팀워크를 중시하고 협력을 잘해요' },
            { id: 'leadership', name: '리더십 있는', description: '팀을 이끌고 동기부여를 잘해요' },
            { id: 'analytical', name: '분석적인', description: '데이터와 논리로 문제를 해결해요' }
        ],
        ages: [
            { id: '20s', name: '20대', description: '20-29세' },
            { id: '30s', name: '30대', description: '30-39세' },
            { id: '40s', name: '40대', description: '40-49세' }
        ],
        jobs: [
            { id: 'manager', name: '팀장', description: '팀을 관리하고 업무를 조율해요' },
            { id: 'developer', name: '개발자', description: '소프트웨어를 개발하고 있어요' },
            { id: 'sales', name: '영업', description: '고객과의 관계를 관리해요' },
            { id: 'hr', name: '인사', description: '인재 채용과 관리업무를 해요' }
        ],
        hobbies: [
            { id: 'networking', name: '네트워킹', description: '업계 사람들과의 교류를 즐겨요' },
            { id: 'reading', name: '독서', description: '비즈니스 서적을 많이 읽어요' },
            { id: 'sports', name: '운동', description: '건강 관리를 위해 운동을 해요' },
            { id: 'conference', name: '컨퍼런스', description: '업계 컨퍼런스 참석을 좋아해요' }
        ]
    },
    hobby: {
        title: '취미 공유용 AI',
        description: '공통 관심사를 나누며 자연스러운 대화를 연습해보세요',
        personalities: [
            { id: 'enthusiastic', name: '열정적인', description: '취미에 대한 열정이 넘쳐요' },
            { id: 'creative', name: '창의적인', description: '새로운 아이디어를 잘 생각해내요' },
            { id: 'patient', name: '차분한', description: '천천히 깊이 있게 대화해요' },
            { id: 'adventurous', name: '모험적인', description: '새로운 경험을 즐겨요' }
        ],
        ages: [
            { id: '20s', name: '20대', description: '20-29세' },
            { id: '30s', name: '30대', description: '30-39세' },
            { id: '40s', name: '40대', description: '40-49세' }
        ],
        jobs: [
            { id: 'artist', name: '예술가', description: '창작 활동을 하고 있어요' },
            { id: 'photographer', name: '사진작가', description: '아름다운 순간을 담아내요' },
            { id: 'writer', name: '작가', description: '글을 쓰고 출판해요' },
            { id: 'musician', name: '음악가', description: '음악을 만들고 연주해요' }
        ],
        hobbies: [
            { id: 'photography', name: '사진', description: '아름다운 순간을 카메라에 담아요' },
            { id: 'gardening', name: '원예', description: '식물을 키우고 가꾸는 걸 좋아해요' },
            { id: 'boardgames', name: '보드게임', description: '다양한 보드게임을 즐겨요' },
            { id: 'fitness', name: '피트니스', description: '운동과 건강 관리를 해요' }
        ]
    },
    custom: {
        title: '나만의 AI 만들기',
        description: '대화하고 싶은 이상형의 특징을 자유롭게 작성해주세요',
        personalities: [
            { id: 'friendly', name: '친근한', description: '누구와도 쉽게 친해져요' },
            { id: 'intellectual', name: '지적인', description: '깊이 있는 대화를 좋아해요' },
            { id: 'humorous', name: '유머러스한', description: '재미있는 이야기를 잘해요' },
            { id: 'empathetic', name: '공감능력이 뛰어난', description: '상대방의 감정을 잘 이해해요' }
        ],
        ages: [
            { id: '20s', name: '20대', description: '20-29세' },
            { id: '30s', name: '30대', description: '30-39세' },
            { id: '40s', name: '40대', description: '40-49세' }
        ],
        jobs: [
            { id: 'doctor', name: '의사', description: '사람들의 건강을 돌봐요' },
            { id: 'lawyer', name: '변호사', description: '정의를 위해 일해요' },
            { id: 'engineer', name: '엔지니어', description: '기술로 문제를 해결해요' },
            { id: 'consultant', name: '컨설턴트', description: '다양한 분야의 조언을 해요' }
        ],
        hobbies: [
            { id: 'movies', name: '영화', description: '다양한 장르의 영화를 좋아해요' },
            { id: 'books', name: '독서', description: '책 읽는 것을 즐겨요' },
            { id: 'games', name: '게임', description: '다양한 게임을 즐겨요' },
            { id: 'volunteer', name: '봉사활동', description: '사회에 도움이 되는 일을 해요' }
        ]
    }
};
const CustomPersonaForm = ({ onCreate, onBack, onCancel, category = 'custom' }) => {
    const [selectedPersonality, setSelectedPersonality] = useState('');
    const [selectedAge, setSelectedAge] = useState('');
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedHobby, setSelectedHobby] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const generatePersona = useGeneratePersona();
    const { currentUserId } = useAppStore();
    const { data: userProfile } = useUserProfile(currentUserId || '');
    const currentCategory = PERSONA_ATTRIBUTES[category];
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 모든 속성이 선택되었는지 확인
        if (!selectedPersonality || !selectedAge || !selectedJob || !selectedHobby) {
            alert('모든 속성을 선택해주세요!');
            return;
        }
        if (!isGenerating) {
            setIsGenerating(true);
            try {
                // 선택된 속성들을 기반으로 설명 생성
                const personality = currentCategory.personalities.find(p => p.id === selectedPersonality);
                const age = currentCategory.ages.find(a => a.id === selectedAge);
                const job = currentCategory.jobs.find(j => j.id === selectedJob);
                const hobby = currentCategory.hobbies.find(h => h.id === selectedHobby);
                const description = `${age?.name} ${personality?.name} ${job?.name}로, ${hobby?.name}을 좋아해요. ${personality?.description}`;
                console.log('🚀 카테고리별 페르소나 생성 시작:', { category, description });
                // AI로 페르소나 생성
                const persona = await generatePersona.mutateAsync({
                    userGender: userProfile?.user_gender || 'male',
                    userInterests: [description],
                    isTutorial: false
                });
                console.log('✅ 카테고리별 페르소나 생성 성공:', persona);
                // 생성된 페르소나를 부모 컴포넌트로 전달
                onCreate?.(persona);
            }
            catch (error) {
                console.error('❌ 페르소나 생성 실패:', error);
                // 실패 시 선택된 속성으로 기본 페르소나 생성
                const partnerGender = userProfile?.user_gender === 'male' ? 'female' : 'male';
                const personality = currentCategory.personalities.find(p => p.id === selectedPersonality);
                const age = currentCategory.ages.find(a => a.id === selectedAge);
                const job = currentCategory.jobs.find(j => j.id === selectedJob);
                const hobby = currentCategory.hobbies.find(h => h.id === selectedHobby);
                const fallbackPersona = {
                    id: `custom-persona-${Date.now()}`,
                    name: partnerGender === 'female' ? '이서영' : '최민수',
                    age: selectedAge === '20s' ? 26 : selectedAge === '30s' ? 32 : 38,
                    gender: partnerGender,
                    job: job?.name || '디자이너',
                    personality: personality?.name || '친근한',
                    interests: [hobby?.name || '여행'],
                    avatar: getRandomAvatar(partnerGender),
                    match_rate: 85,
                    conversation_preview: [
                        { text: `안녕하세요! ${personality?.description} ${hobby?.name}에 대해 이야기해보고 싶어요 😊` }
                    ]
                };
                onCreate?.(fallbackPersona);
            }
            finally {
                setIsGenerating(false);
            }
        }
    };
    const renderAttributeSelector = (title, items, selectedValue, onSelect) => (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-bold text-[#191F28] mb-3", children: title }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: items.map((item) => (_jsxs("button", { type: "button", onClick: () => onSelect(item.id), className: `p-3 rounded-xl border-2 text-left transition-all ${selectedValue === item.id
                        ? 'border-[#F093B0] bg-[#FDF2F8] text-[#F093B0]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#F093B0] hover:bg-[#FDF2F8]'}`, children: [_jsx("div", { className: "font-semibold text-sm mb-1", children: item.name }), _jsx("div", { className: "text-xs text-gray-500", children: item.description })] }, item.id))) })] }));
    return (_jsxs("div", { className: "min-h-screen bg-[#F8FAFC] flex flex-col", children: [_jsxs("div", { className: "bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between", children: [_jsx("button", { onClick: onBack, className: "p-2 -ml-2", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#64748B]" }) }), _jsx("h1", { className: "text-lg font-bold text-[#191F28]", children: currentCategory.title }), _jsx("div", { className: "w-10" })] }), _jsxs("div", { className: "flex-1 p-4", children: [_jsx("div", { className: "mb-6", children: _jsx("p", { className: "text-gray-600 text-sm leading-relaxed", children: currentCategory.description }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [renderAttributeSelector('성격', currentCategory.personalities, selectedPersonality, setSelectedPersonality), renderAttributeSelector('나이', currentCategory.ages, selectedAge, setSelectedAge), renderAttributeSelector('직업', currentCategory.jobs, selectedJob, setSelectedJob), renderAttributeSelector('취미', currentCategory.hobbies, selectedHobby, setSelectedHobby), _jsx("button", { type: "submit", disabled: isGenerating || !selectedPersonality || !selectedAge || !selectedJob || !selectedHobby, className: "w-full py-4 bg-[#F093B0] text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E085A3] transition-colors", children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), _jsx("span", { children: "AI \uC0DD\uC131 \uC911..." })] })) : (_jsxs(_Fragment, { children: [_jsx(SparklesIcon, { className: "w-5 h-5" }), _jsx("span", { children: "\u2728 \uC774\uC0C1\uD615\uACFC \uB300\uD654 \uC2DC\uC791\uD558\uAE30" })] })) })] })] })] }));
};
export default CustomPersonaForm;
