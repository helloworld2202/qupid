import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../shared/stores/userStore';

interface AuthCallbackProps {
  onNavigate?: (screen: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onNavigate }) => {
  const { setUser } = useUserStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const refreshToken = urlParams.get('refresh_token');
      const error = urlParams.get('error');

      if (error) {
        setError('로그인 중 오류가 발생했습니다.');
        setStatus('error');
        return;
      }

      if (!token || !refreshToken) {
        setError('인증 정보를 받아오지 못했습니다.');
        setStatus('error');
        return;
      }

      // 토큰을 localStorage에 저장
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      // 사용자 정보 가져오기
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success && data.data.user) {
        // 사용자 정보를 스토어에 저장
        setUser(data.data.user);
        
        // 사용자 ID 저장
        localStorage.setItem('userId', data.data.user.id);
        
        // 프로필 정보가 있으면 저장
        if (data.data.profile) {
          localStorage.setItem('userProfile', JSON.stringify(data.data.profile));
        }

        setStatus('success');
        
        // 홈으로 리다이렉트
        setTimeout(() => {
          onNavigate?.('HOME');
        }, 1500);
      } else {
        throw new Error('사용자 정보가 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error('Auth callback error:', err);
      setError(err.message || '로그인 처리 중 오류가 발생했습니다.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F093B0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B95A1] text-lg">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#191F28] mb-2">로그인 실패</h2>
          <p className="text-[#8B95A1] mb-6">{error}</p>
          <button
            onClick={() => onNavigate?.('LOGIN')}
            className="w-full h-14 bg-[#F093B0] text-white font-bold rounded-xl hover:bg-[#E881A5] transition-all"
          >
            다시 로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-500 text-2xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-[#191F28] mb-2">로그인 성공!</h2>
        <p className="text-[#8B95A1]">잠시 후 홈으로 이동합니다...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
