import React, { useState } from 'react';
import { Screen } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';

interface SignupScreenProps {
  onNavigate: (screen: Screen | string) => void;
  onSignupSuccess: (userData: any) => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigate, onSignupSuccess }) => {
  const [step, setStep] = useState(1); // 1: 기본정보, 2: 성별선택
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    user_gender: '' as 'male' | 'female' | '',
    partner_gender: '' as 'male' | 'female' | '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      // 기본 정보 검증
      if (!formData.email || !formData.password || !formData.name) {
        setError('모든 필드를 입력해주세요.');
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleSignup = async () => {
    setError('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          user_gender: formData.user_gender,
          partner_gender: formData.partner_gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공
      if (data.data.session) {
        localStorage.setItem('authToken', data.data.session.access_token);
        localStorage.setItem('refreshToken', data.data.session.refresh_token);
        localStorage.setItem('userId', data.data.user.id);
      }
      
      // 프로필 저장
      if (data.data.profile) {
        localStorage.setItem('userProfile', JSON.stringify(data.data.profile));
        
        // 튜토리얼 완료 여부 확인
        if (data.data.profile.is_tutorial_completed) {
          onSignupSuccess(data.data);
          onNavigate('HOME');
        } else {
          onSignupSuccess(data.data);
          onNavigate('ONBOARDING'); // 온보딩으로 이동
        }
      } else {
        onSignupSuccess(data.data);
        onNavigate('ONBOARDING'); // 온보딩으로 이동
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.email && formData.password && formData.passwordConfirm && formData.name;
  const isStep2Valid = formData.user_gender && formData.partner_gender;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* 헤더 */}
      <header className="bg-white px-6 py-4 border-b border-[#E5E8EB] flex items-center">
        <button onClick={() => step === 2 ? setStep(1) : onNavigate('LOGIN')} className="mr-4">
          <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
        </button>
        <h1 className="text-2xl font-bold text-[#191F28]">회원가입</h1>
      </header>

      {/* 진행 표시 */}
      <div className="px-6 pt-6">
        <div className="flex space-x-2">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'}`}></div>
        </div>
        <p className="text-sm text-[#8B95A1] mt-2">
          {step === 1 ? '기본 정보 입력' : '성별 선택'}
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 py-6">
        {step === 1 ? (
          // Step 1: 기본 정보
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름을 입력해주세요"
                className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="이메일을 입력해주세요"
                className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="6자 이상 입력해주세요"
                className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191F28] mb-2">비밀번호 확인</label>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                placeholder="비밀번호를 다시 입력해주세요"
                className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              />
            </div>
          </div>
        ) : (
          // Step 2: 성별 선택
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#191F28] mb-4">당신의 성별은?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, user_gender: 'male' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.user_gender === 'male'
                      ? 'border-[#F093B0] bg-[#FDF2F8]'
                      : 'border-[#E5E8EB] bg-white'
                  }`}
                >
                  <p className="text-3xl mb-2">👨</p>
                  <p className="font-bold text-[#191F28]">남성</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, user_gender: 'female' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.user_gender === 'female'
                      ? 'border-[#F093B0] bg-[#FDF2F8]'
                      : 'border-[#E5E8EB] bg-white'
                  }`}
                >
                  <p className="text-3xl mb-2">👩</p>
                  <p className="font-bold text-[#191F28]">여성</p>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#191F28] mb-4">대화 연습을 원하는 상대 성별은?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, partner_gender: 'male' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.partner_gender === 'male'
                      ? 'border-[#F093B0] bg-[#FDF2F8]'
                      : 'border-[#E5E8EB] bg-white'
                  }`}
                >
                  <p className="text-3xl mb-2">👨</p>
                  <p className="font-bold text-[#191F28]">남성</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, partner_gender: 'female' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.partner_gender === 'female'
                      ? 'border-[#F093B0] bg-[#FDF2F8]'
                      : 'border-[#E5E8EB] bg-white'
                  }`}
                >
                  <p className="text-3xl mb-2">👩</p>
                  <p className="font-bold text-[#191F28]">여성</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8">
        <button
          onClick={step === 1 ? handleNext : handleSignup}
          disabled={(step === 1 ? !isStep1Valid : !isStep2Valid) || isLoading}
          className={`w-full h-14 rounded-full font-bold text-lg transition-all ${
            (step === 1 ? isStep1Valid : isStep2Valid) && !isLoading
              ? 'bg-[#F093B0] text-white'
              : 'bg-[#E5E8EB] text-[#8B95A1]'
          }`}
        >
          {isLoading ? '처리 중...' : step === 1 ? '다음' : '회원가입 완료'}
        </button>
      </div>
    </div>
  );
};

export { SignupScreen };
export default SignupScreen;