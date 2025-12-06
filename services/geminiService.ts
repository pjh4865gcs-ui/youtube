import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysis, ThumbnailData } from "../types";

const modelName = "gemini-2.5-flash";
const imageModelName = "gemini-2.5-flash"; // 이미지 생성 모델

let currentApiKey: string | null = null;

export const setApiKey = (apiKey: string) => {
  currentApiKey = apiKey;
};

const getAI = () => {
  if (!currentApiKey) {
    throw new Error("API 키가 설정되지 않았습니다. API 키를 먼저 설정해주세요.");
  }
  return new GoogleGenAI({ apiKey: currentApiKey });
};

export const analyzeScriptAndGetTopics = async (inputScript: string): Promise<ScriptAnalysis> => {
  const prompt = `
    당신은 전문 유튜브 전략 컨설턴트입니다. 
    다음 대본 초안이나 주제 아이디어를 분석하세요. 모든 응답은 한국어로 작성해 주세요.
    
    1. 예상되는 톤(Tone)을 파악하세요 (예: 교육적, 코믹, 진지함 등).
    2. 타겟 시청자(Target Audience)를 파악하세요.
    3. 3가지 핵심 테마(Key Themes)를 추출하세요.
    4. 이 분석을 바탕으로 동일한 시청자에게 어필하되 새로운 관점을 제시하는 클릭 가능한 바이럴 비디오 제목/주제 5가지를 생성하세요.
    
    입력 텍스트:
    "${inputScript}"
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING, description: "한국어로 된 톤 (예: 유머러스한, 진지한)" },
            targetAudience: { type: Type.STRING, description: "한국어로 된 타겟 시청자 설명" },
            keyThemes: { 
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "한국어로 된 핵심 테마" }
            },
            suggestedTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "눈길을 끄는 한국어 유튜브 제목" },
                  reasoning: { type: Type.STRING, description: "이 제목이 효과적인 이유 (한국어)" }
                },
                required: ["title", "reasoning"]
              }
            }
          },
          required: ["tone", "targetAudience", "keyThemes", "suggestedTopics"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ScriptAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateFullScript = async (
  topic: string, 
  tone: string, 
  audience: string,
  duration: string = '8분',
  style: 'dialogue' | 'narration' = 'dialogue'
): Promise<string> => {
  const styleInstruction = style === 'dialogue' 
    ? '대화 형식으로 작성하세요. 등장인물 간의 자연스러운 대화로 구성하세요.'
    : '나레이션 형식으로 작성하세요. 단독 나레이터가 진행하는 형식으로 구성하세요.';

  const prompt = `
    비디오 제목: "${topic}"에 대한 시청 지속 시간이 높은 완벽한 유튜브 대본을 작성하세요.
    
    타겟 시청자: ${audience}
    원하는 톤: ${tone}
    예상 영상 길이: ${duration}
    대본 스타일: ${styleInstruction}
    
    구조 요구사항:
    1. 후킹 (HOOK) (0-60초): 즉시 관심을 사로잡으세요.
    2. 인트로 (INTRO): 영상의 주제를 명확히 밝히세요.
    3. 본문 (BODY): 명확한 포인트/단계로 나누세요. 가능한 경우 타임스탬프를 사용하세요 (예: [02:30]).
    4. 아웃트로 및 CTA (OUTRO & CTA): 명확한 행동 유도를 포함하세요.
    
    출력은 굵은 헤더와 명확한 간격을 사용하여 마크다운 형식으로 작성하세요. 모든 내용은 한국어로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "대본 생성에 실패했습니다.";
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

export const generateThumbnail = async (topic: string, tone: string): Promise<ThumbnailData> => {
  const prompt = `
    유튜브 비디오 제목 "${topic}"에 대한 매력적인 썸네일을 디자인하세요.
    
    톤: ${tone}
    
    다음 정보를 생성하세요:
    1. 썸네일에 들어갈 메인 텍스트 (짧고 임팩트 있게, 10자 이내)
    2. 서브 텍스트 (선택사항, 있다면 5-8자)
    3. 썸네일 배경 이미지 생성을 위한 상세한 프롬프트 (영어로, 유튜브 썸네일 스타일)
    
    모든 응답은 한국어로 작성하되, imagePrompt만 영어로 작성하세요.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "썸네일 메인 텍스트 (한국어)" },
            subtitle: { type: Type.STRING, description: "썸네일 서브 텍스트 (한국어, 선택사항)" },
            imagePrompt: { type: Type.STRING, description: "이미지 생성 프롬프트 (영어)" }
          },
          required: ["title", "imagePrompt"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ThumbnailData;
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    throw error;
  }
};
