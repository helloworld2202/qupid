import React, { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';

interface CustomPersonaFormProps {
  onCreate: (description: string) => void;
  onBack: () => void;
}

const CustomPersonaForm: React.FC<CustomPersonaFormProps> = ({ onCreate, onBack }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onCreate(description);
    }
  };

  return (
    <div className="flex flex-col h-full animate-back-out" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex-shrink-0 flex items-center p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
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
            disabled={!description.trim()}
            className="w-full mt-6 text-white font-semibold text-lg py-4 px-4 rounded-xl transition-opacity disabled:cursor-not-allowed flex items-center justify-center"
            style={{ 
                backgroundColor: 'var(--primary-pink-main)',
            }}
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            이상형과 대화 시작하기
          </button>
        </form>
      </div>
    </div>
  );
};

export { CustomPersonaForm };
export default CustomPersonaForm;