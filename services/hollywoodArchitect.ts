import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, NewTopicSuggestion, HollywoodScriptResult } from "../types";

const modelName = "gemini-2.5-flash";

let currentApiKey: string | null = null;

export const setHollywoodApiKey = (apiKey: string) => {
  currentApiKey = apiKey;
};

const getAI = () => {
  if (!currentApiKey) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey: currentApiKey });
};

/**
 * ARCHITECT PROMPT - 전체 흐름을 관장하는 설계자
 * Phase 1: 원문 분석
 */
export const analyzeOriginalScript = async (originalScript: string): Promise<ScriptAnalysisResult> => {
  const architectPrompt = `
당신은 **헐리우드 스토리텔링 전문가**이자 **유튜브 콘텐츠 설계자(Architect)**입니다.

## 임무: 원문 분석 (Phase 1)

사용자가 입력한 대본 초안을 분석하여, 헐리우드 영화 기법을 적용할 최적의 전략을 수립하세요.

### 헐리우드 대표 기법들:
1. **삼막 구조 (Three-Act Structure)**: 설정-갈등-해결
2. **영웅의 여정 (Hero's Journey)**: 평범한 주인공의 변화와 성장
3. **인셉션 기법 (Inception Hook)**: 강렬한 시작으로 몰입 유도
4. **타이트 로프 (Tightrope)**: 긴장감 유지하며 위기 고조
5. **반전 기법 (Plot Twist)**: 예상을 뒤엎는 전개
6. **감정 롤러코스터 (Emotional Arc)**: 감정의 기복을 통한 몰입
7. **타임 프레셔 (Time Pressure)**: 시간 제약으로 긴장감 증폭

### 분석 항목:
1. **원본 의도 파악**: 사용자가 전달하고자 하는 핵심 메시지
2. **감정 톤 감지**: 유머, 진지함, 감동, 충격 등
3. **타겟 시청자**: 누구를 위한 콘텐츠인가
4. **최적 영화 기법 추천**: 7가지 중 가장 효과적인 기법 선택
5. **강점 점수**: 현재 대본의 완성도 (1-10점)
6. **개선 영역**: 보완이 필요한 부분들

입력된 대본:
"""
${originalScript}
"""

모든 응답은 한국어로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: architectPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalIntent: { type: Type.STRING },
            detectedEmotion: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            recommendedTechnique: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                examples: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            strengthScore: { type: Type.NUMBER },
            improvementAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["originalIntent", "detectedEmotion", "targetAudience", "recommendedTechnique", "strengthScore", "improvementAreas"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("분석 실패");
    
    return JSON.parse(text) as ScriptAnalysisResult;
  } catch (error) {
    console.error("Script analysis failed:", error);
    throw error;
  }
};

/**
 * ARCHITECT PROMPT - Phase 2: 새로운 주제 제안
 */
export const suggestNewTopics = async (
  analysisResult: ScriptAnalysisResult,
  originalScript: string
): Promise<NewTopicSuggestion[]> => {
  const architectPrompt = `
당신은 **헐리우드 스토리텔링 전문가**이자 **유튜브 콘텐츠 설계자(Architect)**입니다.

## 임무: 새로운 주제 제안 (Phase 2)

### 분석 결과:
- 원본 의도: ${analysisResult.originalIntent}
- 감정 톤: ${analysisResult.detectedEmotion}
- 타겟 시청자: ${analysisResult.targetAudience}
- 추천 기법: ${analysisResult.recommendedTechnique.name}
- 현재 강점 점수: ${analysisResult.strengthScore}/10

### 임무:
추천된 헐리우드 기법 "${analysisResult.recommendedTechnique.name}"을 활용하여,
**바이럴 가능성이 높은 새로운 주제 5가지**를 제안하세요.

### 요구사항:
1. 각 주제는 원본의 핵심 메시지를 유지하되, 더 강렬하게 포장
2. 헐리우드 기법이 명확히 적용되도록 구조화
3. 클릭을 유도하는 매력적인 제목
4. 첫 30초 훅(Hook) 전략 포함
5. 바이럴 가능성 점수 (1-10) 및 이유 명시

모든 응답은 한국어로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: architectPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  hook: { type: Type.STRING },
                  appliedTechnique: { type: Type.STRING },
                  viralPotential: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING }
                },
                required: ["title", "hook", "appliedTechnique", "viralPotential", "reasoning"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("주제 제안 실패");
    
    const parsed = JSON.parse(text);
    return parsed.suggestions as NewTopicSuggestion[];
  } catch (error) {
    console.error("Topic suggestion failed:", error);
    throw error;
  }
};

/**
 * ARCHITECT PROMPT - Phase 3: 헐리우드 기법 적용 대본 작성
 */
export const generateHollywoodScript = async (
  topic: NewTopicSuggestion,
  analysisResult: ScriptAnalysisResult,
  duration: string = "8분"
): Promise<HollywoodScriptResult> => {
  const architectPrompt = `
당신은 **헐리우드 스토리텔링 전문가**이자 **유튜브 콘텐츠 설계자(Architect)**입니다.

## 임무: 헐리우드 기법 적용 대본 작성 (Phase 3)

### 선택된 주제:
- 제목: ${topic.title}
- 훅 전략: ${topic.hook}
- 적용 기법: ${topic.appliedTechnique}
- 바이럴 가능성: ${topic.viralPotential}/10

### 타겟 정보:
- 시청자: ${analysisResult.targetAudience}
- 감정 톤: ${analysisResult.detectedEmotion}
- 예상 길이: ${duration}

### 작성 요구사항:

#### 1. ${topic.appliedTechnique} 기법 엄격 적용
${analysisResult.recommendedTechnique.description}

#### 2. 삼막 구조로 작성:

**ACT 1 - 설정 (0-30초)**
- 강력한 훅으로 시작
- 문제/호기심 유발
- 영상의 가치 약속

**ACT 2 - 갈등/전개 (본문)**
- 핵심 포인트 3-5개
- 각 포인트마다 긴장감 유지
- 예시와 스토리텔링 활용
- 감정 기복 설계

**ACT 3 - 해결/클라이맥스 (마무리)**
- 핵심 메시지 재강조
- 감동적/충격적 마무리
- 명확한 CTA

#### 3. 출력 형식:
- 마크다운 형식
- 타임스탬프 포함 [00:00]
- **굵은 글씨**로 강조점 표시
- 감정 방향 지시 포함 예: (흥분된 톤으로), (진지하게)

모든 응답은 한국어로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: architectPrompt,
    });

    const fullScript = response.text || "대본 생성 실패";

    // 구조 추출
    const act1Match = fullScript.match(/ACT 1[^\n]*\n([\s\S]*?)(?=ACT 2|$)/i);
    const act2Match = fullScript.match(/ACT 2[^\n]*\n([\s\S]*?)(?=ACT 3|$)/i);
    const act3Match = fullScript.match(/ACT 3[^\n]*\n([\s\S]*?)$/i);

    return {
      technique: topic.appliedTechnique,
      structure: {
        act1: act1Match ? act1Match[1].trim() : '',
        act2: act2Match ? act2Match[1].trim() : '',
        act3: act3Match ? act3Match[1].trim() : ''
      },
      fullScript,
      keyElements: [
        `${topic.appliedTechnique} 기법 적용`,
        "삼막 구조 완성",
        `바이럴 가능성 ${topic.viralPotential}/10`,
        `타겟: ${analysisResult.targetAudience}`
      ]
    };
  } catch (error) {
    console.error("Hollywood script generation failed:", error);
    throw error;
  }
};
