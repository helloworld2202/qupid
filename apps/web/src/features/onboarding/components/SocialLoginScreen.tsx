import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

interface SocialLoginUrls {
  kakao: string;
  naver: string;
  google: string;
}

interface SocialLoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  progress: number;
}

const SocialLoginScreen: React.FC<SocialLoginScreenProps> = ({ onBack, onSuccess, progress }) => {
  const [socialUrls, setSocialUrls] = useState<SocialLoginUrls | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSocialLoginUrls();
  }, []);

  const fetchSocialLoginUrls = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_URL}/auth/social/urls`);
      const data = await response.json();
      
      if (data.success) {
        setSocialUrls(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch social login URLs:', error);
    }
  };

  const handleSocialLogin = (provider: string, url: string) => {
    setLoading(true);
    // 온보딩 플로우임을 표시
    localStorage.setItem('isOnboardingFlow', 'true');
    window.location.href = url;
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in p-6">
      {/* 헤더 */}
      <header className="absolute top-4 left-6 right-6 h-14 flex items-center justify-between z-10">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
        </button>
        <div className="flex items-center space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < progress ? 'w-2.5 h-2.5 bg-[#F093B0]' : 'w-2 h-2 bg-[#E5E8EB]'
              }`}
            />
          ))}
        </div>
        <div className="w-10"></div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col justify-center -mt-14">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold leading-tight text-[#191F28] mb-4">
            간편하게<br/>
            <span className="text-[#F093B0]">시작하기</span>
          </h1>
          <p className="text-lg text-[#8B95A1]">
            소셜 계정으로 빠르게 가입하고<br/>
            연애 코칭을 시작해보세요
          </p>
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-4">
          {!socialUrls ? (
            // 로딩 상태
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* 카카오 로그인 */}
              <button
                onClick={() => handleSocialLogin('kakao', socialUrls.kakao)}
                disabled={loading}
                className="w-full h-16 bg-[#FEE500] hover:bg-[#FDD835] disabled:bg-[#F5F5F5] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">K</span>
                </div>
                <span className="text-black font-bold text-lg">
                  {loading ? '연결 중...' : '카카오로 계속하기'}
                </span>
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={() => handleSocialLogin('naver', socialUrls.naver)}
                disabled={loading}
                className="w-full h-16 bg-[#03C75A] hover:bg-[#02B351] disabled:bg-[#F5F5F5] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#03C75A] text-lg font-bold">N</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {loading ? '연결 중...' : '네이버로 계속하기'}
                </span>
              </button>

              {/* 구글 로그인 */}
              <button
                onClick={() => handleSocialLogin('google', socialUrls.google)}
                disabled={loading}
                className="w-full h-16 bg-white hover:bg-gray-50 disabled:bg-[#F5F5F5] border-2 border-[#E5E8EB] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm"
              >
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" className="w-8 h-8">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <span className="text-[#191F28] font-bold text-lg">
                  {loading ? '연결 중...' : '구글로 계속하기'}
                </span>
              </button>
            </>
          )}
        </div>

        {/* 하단 텍스트 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#8B95A1]">
            로그인 시 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의하게 됩니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SocialLoginScreen;
