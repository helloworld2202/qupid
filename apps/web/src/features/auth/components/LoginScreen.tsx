import React, { useState } from 'react';
import { Screen } from '@qupid/core';

interface LoginScreenProps {
  onNavigate: (screen: Screen | string) => void;
  onLoginSuccess: (userData: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      // 로그인 성공
      localStorage.setItem('authToken', data.data.session.access_token);
      localStorage.setItem('refreshToken', data.data.session.refresh_token);
      localStorage.setItem('userId', data.data.user.id);
      
      // 프로필 저장
      if (data.data.profile) {
        localStorage.setItem('userProfile', JSON.stringify(data.data.profile));
        
        // 튜토리얼 완료 여부 확인
        if (!data.data.profile.is_tutorial_completed) {
          onLoginSuccess(data.data);
          onNavigate(Screen.TutorialIntro); // 튜토리얼로 이동
        } else {
          onLoginSuccess(data.data);
          onNavigate('HOME');
        }
      } else {
        onLoginSuccess(data.data);
        onNavigate('HOME');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length >= 6;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* 헤더 */}
      <header className="bg-white px-6 py-4 border-b border-[#E5E8EB]">
        <h1 className="text-2xl font-bold text-[#191F28]">로그인</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 py-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              disabled={isLoading}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-[#191F28] mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base"
              disabled={isLoading}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full h-14 rounded-full font-bold text-lg transition-all ${
              isFormValid && !isLoading
                ? 'bg-[#F093B0] text-white'
                : 'bg-[#E5E8EB] text-[#8B95A1]'
            }`}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="my-8 flex items-center">
          <div className="flex-1 h-px bg-[#E5E8EB]"></div>
          <span className="px-4 text-sm text-[#8B95A1]">또는</span>
          <div className="flex-1 h-px bg-[#E5E8EB]"></div>
        </div>

        {/* 회원가입 링크 */}
        <div className="text-center">
          <p className="text-sm text-[#8B95A1] mb-3">아직 계정이 없으신가요?</p>
          <button
            onClick={() => onNavigate('SIGNUP')}
            className="text-[#4F7ABA] font-bold"
            disabled={isLoading}
          >
            회원가입하기
          </button>
        </div>

        {/* 비밀번호 찾기 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('RESET_PASSWORD')}
            className="text-sm text-[#8B95A1] underline"
            disabled={isLoading}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </main>
    </div>
  );
};

export { LoginScreen };
export default LoginScreen;