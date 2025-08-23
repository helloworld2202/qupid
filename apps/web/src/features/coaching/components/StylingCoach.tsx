import React, { useState, useCallback } from 'react';
import { getStylingAdvice } from '@/services/openaiService';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';

interface StylingCoachProps {
  onBack: () => void;
}

const StylingCoach: React.FC<StylingCoachProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ text: string; imageUrl: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await getStylingAdvice(prompt);
      if (response.text && response.imageUrl) {
        setResult(response);
      } else {
        setError('스타일 추천을 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="flex flex-col h-full animate-back-out" style={{ backgroundColor: 'var(--surface)' }}>
       <header className="flex-shrink-0 flex items-center p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeftIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AI 스타일링 코치</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          어떤 상황에 어울리는 스타일이 궁금하신가요? 구체적으로 질문해보세요.
          <br />
          <span className="text-sm">(예: 20대 후반 남성, 첫 소개팅을 위한 깔끔한 캐주얼룩)</span>
        </p>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="궁금한 스타일을 입력하세요..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--border)', 
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--secondary-blue-main)'
              } as React.CSSProperties}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="text-white font-semibold py-3 px-6 rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-pink-main)'}}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><SparklesIcon className="w-5 h-5 mr-2" /> 스타일 추천받기</>
              )}
            </button>
          </div>
        </form>

        {error && <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--error-red-light)', color: 'var(--error-red)'}}>{error}</div>}

        {result && (
          <div className="mt-6 space-y-6 animate-fade-in-down">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--background)'}}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>AI 추천 이미지</h3>
              {result.imageUrl ? (
                <img src={result.imageUrl} alt="AI generated style" className="w-full rounded-lg shadow-md" />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p style={{ color: 'var(--text-tertiary)'}}>이미지를 불러올 수 없습니다.</p>
                </div>
              )}
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--background)'}}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>스타일링 조언</h3>
              <p className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { StylingCoach };
export default StylingCoach;