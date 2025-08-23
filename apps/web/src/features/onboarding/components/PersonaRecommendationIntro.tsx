import React from 'react';

interface PersonaRecommendationIntroProps {
  onContinue: () => void;
}

const PersonaRecommendationIntro: React.FC<PersonaRecommendationIntroProps> = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          맞춤형 페르소나 추천
        </h1>
        <p className="text-gray-600 mb-6">
          당신의 연애 스타일과 목표에 맞는
          <br />
          완벽한 대화 상대를 찾아드릴게요.
        </p>
      </div>
      
      <div className="w-full max-w-xs">
        <button 
          onClick={onContinue}
          className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export { PersonaRecommendationIntro };
export default PersonaRecommendationIntro;