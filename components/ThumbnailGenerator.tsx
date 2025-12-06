import React, { useState } from 'react';
import { Image, Download, RefreshCw, Wand2 } from 'lucide-react';
import { generateThumbnail } from '../services/geminiService';
import { ThumbnailData } from '../types';

interface ThumbnailGeneratorProps {
  topic: string;
  tone: string;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ topic, tone }) => {
  const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);

  const handleGenerateThumbnail = async () => {
    setIsGenerating(true);
    try {
      const data = await generateThumbnail(topic, tone);
      setThumbnailData(data);
    } catch (error) {
      alert("썸네일 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageWithPrompt = async () => {
    if (!thumbnailData) return;
    
    // Pollinations.ai를 사용한 이미지 생성
    const encodedPrompt = encodeURIComponent(thumbnailData.imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true`;
    
    setThumbnailData({
      ...thumbnailData,
      imageUrl
    });
    setImageGenerated(true);
  };

  const downloadThumbnail = () => {
    if (!thumbnailData?.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = thumbnailData.imageUrl;
    link.download = `thumbnail-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Image className="mr-2 text-purple-400" size={24} />
          썸네일 생성
        </h3>
        {!thumbnailData && (
          <button
            onClick={handleGenerateThumbnail}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>썸네일 생성</span>
              </>
            )}
          </button>
        )}
      </div>

      {thumbnailData && (
        <div className="space-y-4">
          {/* 썸네일 미리보기 영역 */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {thumbnailData.imageUrl ? (
              <img 
                src={thumbnailData.imageUrl} 
                alt="Generated Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <Image size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 mb-4">이미지 생성 대기 중</p>
                <button
                  onClick={generateImageWithPrompt}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-all"
                >
                  이미지 생성하기
                </button>
              </div>
            )}
            
            {/* 텍스트 오버레이 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-2 stroke-text">
                {thumbnailData.title}
              </h2>
              {thumbnailData.subtitle && (
                <p className="text-xl md:text-2xl font-bold text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {thumbnailData.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* 프롬프트 정보 */}
          <div className="bg-slate-950 rounded-lg p-4">
            <label className="text-slate-500 text-xs uppercase font-bold mb-2 block">이미지 프롬프트</label>
            <p className="text-slate-300 text-sm leading-relaxed">{thumbnailData.imagePrompt}</p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={generateImageWithPrompt}
              disabled={!imageGenerated}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              <RefreshCw size={18} />
              <span>새 이미지 생성</span>
            </button>
            <button
              onClick={downloadThumbnail}
              disabled={!thumbnailData.imageUrl}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Download size={18} />
              <span>다운로드</span>
            </button>
            <button
              onClick={handleGenerateThumbnail}
              className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              <Wand2 size={18} />
              <span>다시 생성</span>
            </button>
          </div>
        </div>
      )}

      {!thumbnailData && !isGenerating && (
        <p className="text-slate-400 text-center py-8">
          썸네일 생성 버튼을 클릭하여 매력적인 썸네일을 만들어보세요
        </p>
      )}

      <style>{`
        .stroke-text {
          text-shadow: 
            -2px -2px 0 #000,  
            2px -2px 0 #000,
            -2px 2px 0 #000,
            2px 2px 0 #000,
            0 0 20px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};
