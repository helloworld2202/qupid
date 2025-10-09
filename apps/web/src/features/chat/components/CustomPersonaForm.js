import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';
import { useGeneratePersona } from '../../../shared/hooks/usePersonaGeneration';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useUserProfile } from '../../../shared/hooks/api/useUser';
import { getRandomAvatar } from '../../../shared/utils/avatarGenerator';
const CustomPersonaForm = ({ onCreate, onBack, onCancel }) => {
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const generatePersona = useGeneratePersona();
    const { currentUserId } = useAppStore();
    const { data: userProfile } = useUserProfile(currentUserId || '');
    const handleSubmit = async (e) => {
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
            }
            catch (error) {
                console.error('❌ 페르소나 생성 실패:', error);
                // 실패 시 기본 페르소나 생성
                const partnerGender = userProfile?.user_gender === 'male' ? 'female' : 'male';
                const personaName = partnerGender === 'female' ? '이서영' : '최민수';
                const fallbackPersona = {
                    id: `custom-persona-${Date.now()}`,
                    name: personaName,
                    age: 26,
                    gender: partnerGender,
                    avatar: getRandomAvatar(partnerGender),
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
            }
            finally {
                setIsGenerating(false);
            }
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full animate-back-out", style: { backgroundColor: 'var(--surface)' }, children: [_jsxs("header", { className: "flex-shrink-0 flex items-center p-3 border-b", style: { borderColor: 'var(--border)' }, children: [_jsx("button", { onClick: onBack || onCancel, className: "p-2 rounded-full hover:bg-gray-100 mr-2", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6", style: { color: 'var(--text-secondary)' } }) }), _jsx("h2", { className: "text-xl font-bold", style: { color: 'var(--text-primary)' }, children: "\uB098\uB9CC\uC758 \uC774\uC0C1\uD615 \uB9CC\uB4E4\uAE30" })] }), _jsxs("div", { className: "flex-grow flex flex-col p-6", children: [_jsxs("p", { className: "mb-4 text-base", style: { color: 'var(--text-secondary)' }, children: ["\uB300\uD654\uD558\uACE0 \uC2F6\uC740 \uC774\uC0C1\uD615\uC758 \uD2B9\uC9D5\uC744 \uC790\uC720\uB86D\uAC8C \uC791\uC131\uD574\uC8FC\uC138\uC694.", _jsx("br", {}), _jsx("span", { className: "text-sm", children: "(\uC608: 30\uB300 \uCD08\uBC18\uC758 \uB2E4\uC815\uD55C \uC0AC\uC5C5\uAC00, \uB3D9\uBB3C\uC744 \uC88B\uC544\uD558\uACE0 \uC5EC\uD589\uC744 \uC990\uAE40)" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex-grow flex flex-col", children: [_jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "\uC131\uACA9, \uB098\uC774, \uC9C1\uC5C5, \uCDE8\uBBF8, \uAC00\uCE58\uAD00 \uB4F1\uC744 \uC0C1\uC138\uD788 \uC801\uC744\uC218\uB85D \uB354 \uD604\uC2E4\uC801\uC778 AI\uAC00 \uB9CC\uB4E4\uC5B4\uC838\uC694.", className: "w-full flex-grow p-4 border rounded-xl focus:outline-none focus:ring-2 resize-none text-base", style: {
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--background)',
                                    '--tw-ring-color': 'var(--secondary-blue-main)'
                                }, rows: 10 }), _jsx("button", { type: "submit", disabled: !description.trim() || isGenerating, className: "w-full mt-6 text-white font-semibold text-lg py-4 px-4 rounded-xl transition-opacity disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center", style: {
                                    backgroundColor: 'var(--primary-pink-main)',
                                }, children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }), "AI\uAC00 \uC774\uC0C1\uD615\uC744 \uB9CC\uB4E4\uACE0 \uC788\uC5B4\uC694..."] })) : (_jsxs(_Fragment, { children: [_jsx(SparklesIcon, { className: "w-5 h-5 mr-2" }), "\uC774\uC0C1\uD615\uACFC \uB300\uD654 \uC2DC\uC791\uD558\uAE30"] })) })] })] })] }));
};
export { CustomPersonaForm };
export default CustomPersonaForm;
