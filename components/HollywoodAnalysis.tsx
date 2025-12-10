import React, { useState } from 'react';
import { ScriptAnalysisResult, NewTopicSuggestion } from '../types';
import { Film, TrendingUp, Users, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface HollywoodAnalysisProps {
  analysisResult: ScriptAnalysisResult;
  topicSuggestions: NewTopicSuggestion[];
  onSelectTopic: (topic: NewTopicSuggestion) => void;
  onBack: () => void;
}

const HollywoodAnalysis: React.FC<HollywoodAnalysisProps> = ({
  analysisResult,
  topicSuggestions,
  onSelectTopic,
  onBack
}) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-8">
      {/* 분석 결과 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Film className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">헐리우드 기법 분석 결과</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 원본 의도 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-700">핵심 의도</h3>
            </div>
            <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{analysisResult.originalIntent}</p>
          </div>

          {/* 감정 톤 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-700">감정 톤</h3>
            </div>
            <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{analysisResult.detectedEmotion}</p>
          </div>

          {/* 타겟 시청자 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-700">타겟 시청자</h3>
            </div>
            <p className="text-gray-600 bg-orange-50 p-3 rounded-lg">{analysisResult.targetAudience}</p>
          </div>

          {/* 강점 점수 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-700">현재 대본 강점 점수</h3>
            </div>
            <div className={`${getScoreBgColor(analysisResult.strengthScore)} p-3 rounded-lg flex items-center justify-between`}>
              <span className={`text-2xl font-bold ${getScoreColor(analysisResult.strengthScore)}`}>
                {analysisResult.strengthScore}/10
              </span>
              <span className="text-sm text-gray-600">
                {analysisResult.strengthScore >= 8 ? '우수' : analysisResult.strengthScore >= 6 ? '보통' : '개선 필요'}
              </span>
            </div>
          </div>
        </div>

        {/* 추천 기법 */}
        <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-purple-900 mb-3 flex items-center gap-2">
            <Film className="w-6 h-6" />
            추천 헐리우드 기법
          </h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-purple-800">{analysisResult.recommendedTechnique.name}</p>
            <p className="text-gray-700">{analysisResult.recommendedTechnique.description}</p>
            {analysisResult.recommendedTechnique.examples.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm text-gray-600 mb-2">예시 작품:</p>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.recommendedTechnique.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-gray-600">{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 개선 영역 */}
        {analysisResult.improvementAreas.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              개선이 필요한 영역
            </h3>
            <ul className="space-y-2">
              {analysisResult.improvementAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 새 주제 제안 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-pink-200">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-800">바이럴 가능성 높은 새 주제</h2>
        </div>

        <div className="space-y-4">
          {topicSuggestions.map((topic, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedTopicIndex === index
                  ? 'border-pink-500 bg-pink-50 shadow-lg'
                  : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedTopicIndex(index)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{topic.title}</h3>
                <div className="flex items-center gap-2 ml-4">
                  <TrendingUp className={`w-5 h-5 ${topic.viralPotential >= 8 ? 'text-green-600' : topic.viralPotential >= 6 ? 'text-yellow-600' : 'text-red-600'}`} />
                  <span className={`font-bold text-lg ${topic.viralPotential >= 8 ? 'text-green-600' : topic.viralPotential >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {topic.viralPotential}/10
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">🎣 훅 전략 (첫 30초)</p>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{topic.hook}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">🎬 적용 기법</p>
                  <p className="text-purple-700 font-medium">{topic.appliedTechnique}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">💡 선정 이유</p>
                  <p className="text-gray-600 text-sm">{topic.reasoning}</p>
                </div>
              </div>

              {selectedTopicIndex === index && (
                <div className="mt-4 pt-4 border-t border-pink-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTopic(topic);
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    이 주제로 대본 생성하기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
      >
        ← 다시 입력하기
      </button>
    </div>
  );
};

export default HollywoodAnalysis;
