import React from 'react';
import { X } from 'lucide-react';

interface StyleAnalysis {
  currentStyle: {
    type: string;
    characteristics: string[];
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: {
    category: string;
    tips: string[];
    examples: string[];
  }[];
}

interface StyleRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: StyleAnalysis | null;
  isLoading?: boolean;
}

export const StyleRecommendationModal: React.FC<StyleRecommendationModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            💡 대화 스타일 분석
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F093B0]" />
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Current Style */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2">
                  당신의 대화 스타일: {analysis.currentStyle.type}
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">특징</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.currentStyle.characteristics.map((char, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-white/70 rounded-full">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.currentStyle.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">✅ 강점</p>
                      <ul className="text-xs space-y-0.5">
                        {analysis.currentStyle.strengths.map((strength, idx) => (
                          <li key={idx}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.currentStyle.weaknesses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-700 mb-1">💭 개선점</p>
                      <ul className="text-xs space-y-0.5">
                        {analysis.currentStyle.weaknesses.map((weakness, idx) => (
                          <li key={idx}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">추천 개선 방법</h3>
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                      <h4 className="font-medium text-sm mb-2 text-[#F093B0]">
                        📌 {rec.category}
                      </h4>
                      
                      {rec.tips.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Tips</p>
                          <ul className="text-xs space-y-0.5">
                            {rec.tips.map((tip, tipIdx) => (
                              <li key={tipIdx} className="text-gray-700">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rec.examples.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">예시</p>
                          <div className="space-y-1">
                            {rec.examples.map((example, exIdx) => (
                              <div key={exIdx} className="text-xs bg-white p-2 rounded-lg italic text-gray-600">
                                "{example}"
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              분석 결과가 없습니다
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#F093B0] text-white rounded-xl font-medium hover:bg-[#E580A0] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};