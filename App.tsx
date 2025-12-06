import React, { useState } from 'react';
import { Sparkles, PenTool, ArrowRight, RotateCcw, Copy, CheckCircle2, Youtube, Wand2, FileText, FileDown } from 'lucide-react';
import { analyzeScriptAndGetTopics, generateFullScript, setApiKey } from './services/geminiService';
import { AppStep, ScriptAnalysis, TopicSuggestion, ScriptOptions } from './types';
import { StepIndicator } from './components/StepIndicator';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyManager } from './components/ApiKeyManager';
import { ThumbnailGenerator } from './components/ThumbnailGenerator';
import { ScriptFlowMap } from './components/ScriptFlowMap';
import { downloadAsWord, downloadAsPDF } from './utils/documentExport';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [inputScript, setInputScript] = useState('');
  const [scriptOptions, setScriptOptions] = useState<ScriptOptions>({
    category: '',
    duration: '8분',
    style: 'dialogue',
    customIdeas: ''
  });
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicSuggestion | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [scriptStructure, setScriptStructure] = useState<any>(null);

  // API Key Handler
  const handleApiKeySet = (apiKey: string) => {
    setApiKey(apiKey);
    setHasApiKey(true);
  };

  // Handlers
  const handleAnalyze = async () => {
    if (!inputScript.trim()) return;
    if (!hasApiKey) {
      alert("먼저 Gemini API 키를 설정해주세요.");
      return;
    }
    
    setStep(AppStep.ANALYZING);
    try {
      const result = await analyzeScriptAndGetTopics(inputScript);
      setAnalysis(result);
      setStep(AppStep.SELECTION);
    } catch (error) {
      alert("스크립트 분석에 실패했습니다. API 키를 확인해 주세요.");
      setStep(AppStep.INPUT);
    }
  };

  const handleGenerate = async (topic: TopicSuggestion) => {
    if (!analysis) return;
    
    setSelectedTopic(topic);
    setStep(AppStep.GENERATING);
    try {
      const script = await generateFullScript(
        topic.title, 
        analysis.tone, 
        analysis.targetAudience,
        scriptOptions.duration || '8분',
        scriptOptions.style || 'dialogue'
      );
      setGeneratedScript(script);
      setStep(AppStep.RESULT);
    } catch (error) {
      alert("대본 생성에 실패했습니다.");
      setStep(AppStep.SELECTION);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setInputScript('');
    setScriptOptions({
      category: '',
      duration: '8분',
      style: 'dialogue',
      customIdeas: ''
    });
    setAnalysis(null);
    setSelectedTopic(null);
    setGeneratedScript('');
  };

  const handleBackToInput = () => {
    setStep(AppStep.INPUT);
    // 입력 내용은 유지
  };

  const handleBackToSelection = () => {
    setStep(AppStep.SELECTION);
    setSelectedTopic(null);
    setGeneratedScript('');
  };

  const handleStructureChange = (structure: any) => {
    setScriptStructure(structure);
  };

  const generateScriptFromStructure = () => {
    if (!scriptStructure) return '';
    
    const nodeToText = (node: any, level: number = 0): string => {
      let text = '';
      
      // root 노드는 건너뛰기
      if (node.id === 'root') {
        if (node.children && node.children.length > 0) {
          text += node.children.map((child: any) => nodeToText(child, level)).join('\n');
        }
        return text;
      }
      
      // 섹션 헤더 (HOOK, INTRO, BODY, OUTRO)
      if (node.type === 'hook' || node.type === 'intro' || node.type === 'body' || node.type === 'outro') {
        text += `\n${'='.repeat(60)}\n`;
        text += `**${node.title}**\n`;
        text += `${'='.repeat(60)}\n\n`;
        
        if (node.children && node.children.length > 0) {
          text += node.children.map((child: any) => nodeToText(child, level + 1)).join('\n');
        }
      }
      // 핵심 포인트
      else if (node.type === 'point') {
        text += `\n### ${node.title}\n\n`;
        
        if (node.children && node.children.length > 0) {
          text += node.children.map((child: any) => nodeToText(child, level + 1)).join('\n');
        }
      }
      // 세부 내용
      else if (node.type === 'detail') {
        text += `- ${node.title}\n`;
        
        if (node.children && node.children.length > 0) {
          text += node.children.map((child: any) => nodeToText(child, level + 1)).join('\n');
        }
      }
      // 기타
      else {
        text += `${'  '.repeat(level)}- ${node.title}\n`;
        
        if (node.children && node.children.length > 0) {
          text += node.children.map((child: any) => nodeToText(child, level + 1)).join('\n');
        }
      }
      
      return text;
    };
    
    const script = nodeToText(scriptStructure);
    return script || '논리 흐름도에 내용을 입력해주세요.';
  };

  // Render Helpers
  const renderInput = () => (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* YouTube URL Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <label htmlFor="youtube-url" className="block text-lg font-semibold text-slate-200 mb-4">
          유튜브 URL 입력 (선택사항)
        </label>
        <input
          id="youtube-url"
          type="text"
          className="w-full bg-slate-950 text-slate-100 border-2 border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-600 outline-none"
          placeholder="https://www.youtube.com/watch?v=..."
          value={scriptOptions.youtubeUrl || ''}
          onChange={(e) => setScriptOptions({...scriptOptions, youtubeUrl: e.target.value})}
        />
      </div>

      {/* Category Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <label className="block text-lg font-semibold text-slate-200 mb-4">
          카테고리 선택 <span className="text-slate-500 text-sm font-normal">(드래그하여 손쉽 변경)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {['쓸 재널', '건강', '미스테리', '야담', '49금', '국룡', '북한 이슈', '정보 전달', '쇼핑 리뷰', 'IT/테크', '요리/국방', '뷰티', '게임', '먹방', '브이로그'].map((cat) => (
            <button
              key={cat}
              onClick={() => setScriptOptions({...scriptOptions, category: cat})}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                scriptOptions.category === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Duration and Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <label className="block text-lg font-semibold text-slate-200 mb-4">
            예상 영상 길이
          </label>
          <div className="flex flex-wrap gap-2">
            {['8분', '30분', '1시간', '사용자 입력'].map((dur) => (
              <button
                key={dur}
                onClick={() => setScriptOptions({...scriptOptions, duration: dur})}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  scriptOptions.duration === dur
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <label className="block text-lg font-semibold text-slate-200 mb-4">
            대본 스타일
          </label>
          <div className="space-y-3">
            <button
              onClick={() => setScriptOptions({...scriptOptions, style: 'dialogue'})}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                scriptOptions.style === 'dialogue'
                  ? 'bg-red-600 text-white border-2 border-red-500'
                  : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="font-bold mb-1">🗣️ 대화 버전</div>
              <div className="text-sm opacity-80">등장인물 간 대화 형식</div>
            </button>
            <button
              onClick={() => setScriptOptions({...scriptOptions, style: 'narration'})}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                scriptOptions.style === 'narration'
                  ? 'bg-red-600 text-white border-2 border-red-500'
                  : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="font-bold mb-1">📖 나레이션 버전</div>
              <div className="text-sm opacity-80">단독 나레이터 형식</div>
            </button>
          </div>
        </div>
      </div>

      {/* New Ideas Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <label className="block text-lg font-semibold text-slate-200 mb-4">
          새로운 아이디어 제안
        </label>
        <div className="mb-4">
          <input
            type="text"
            className="w-full bg-slate-950 text-slate-100 border-2 border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-600 outline-none"
            placeholder="원하는 키워드 입력 (선택사항) - 예: 다이어트, 여행, 게임"
            value={scriptOptions.customIdeas}
            onChange={(e) => setScriptOptions({...scriptOptions, customIdeas: e.target.value})}
          />
          <p className="text-slate-500 text-sm mt-2 flex items-start">
            <span className="mr-2">💡</span>
            특정 키워드를 입력하고 '적용' 버튼을 누르면 해당 키워드를 포함한 아이디어가 생성됩니다.
          </p>
        </div>
      </div>

      {/* Thumbnail Title Input (Optional) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <label className="block text-lg font-semibold text-slate-200 mb-4">
          썸네일 제목 직접 입력 또는 아이디어 선택
        </label>
        <p className="text-slate-400 text-sm mb-4">
          영상 분석을 불러올게 있습니다.
        </p>
      </div>

      {/* Main Script Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <label htmlFor="script-input" className="block text-lg font-semibold text-slate-200 mb-4">
          대본 초안이나 영상 아이디어를 입력하세요
        </label>
        <textarea
          id="script-input"
          className="w-full h-64 bg-slate-950 text-slate-100 border-2 border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-lg leading-relaxed placeholder:text-slate-600 outline-none"
          placeholder="예: 2024년에 코딩 배우는 법에 대한 영상을 만들고 싶어. 파이썬 이야기랑 튜토리얼 지옥 피하는 법, 그리고 프로젝트 만드는 것에 대해 이야기하면 좋을 것 같은데..."
          value={inputScript}
          onChange={(e) => setInputScript(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-slate-500 text-sm">
            {inputScript.length} 자
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!inputScript.trim()}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            <Sparkles size={20} />
            <span>분석 및 아이디어 생성</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {analysis && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToInput}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            <span>입력으로 돌아가기</span>
          </button>

          {/* Script Flow Map */}
          <ScriptFlowMap onStructureChange={handleStructureChange} />

          {/* Generate Script from Structure Button */}
          {scriptStructure && (
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">📝 구조 기반 대본 생성</h3>
                  <p className="text-slate-300 text-sm">
                    위에서 작성한 논리 흐름도를 하나의 완성된 대본으로 통합합니다.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const structuredScript = generateScriptFromStructure();
                    setGeneratedScript(structuredScript);
                    setSelectedTopic({ title: '구조 기반 대본', reasoning: '논리 흐름도에서 생성됨' });
                    setStep(AppStep.RESULT);
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  <Sparkles size={20} />
                  <span>대본 생성하기</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
              <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-sm mb-4">콘텐츠 전략</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-500 text-xs uppercase font-bold">감지된 톤 (Tone)</label>
                  <p className="text-white font-medium text-lg">{analysis.tone}</p>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase font-bold">타겟 시청자</label>
                  <p className="text-white font-medium text-lg">{analysis.targetAudience}</p>
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase font-bold">핵심 테마</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.keyThemes.map((theme, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Panel */}
          <div className="lg:col-span-2">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Wand2 className="mr-2 text-indigo-400" />
              새로운 접근 방식 선택
             </h2>
             <div className="grid grid-cols-1 gap-4">
                {analysis.suggestedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGenerate(topic)}
                    className="group relative bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 text-left transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-indigo-100 mb-2 group-hover:text-indigo-400 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {topic.reasoning}
                        </p>
                      </div>
                      <ArrowRight className="text-slate-700 group-hover:text-indigo-500 transition-colors ml-4 mt-1" />
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );

  const renderResult = () => (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBackToSelection}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowRight className="rotate-180" size={20} />
        <span>주제 선택으로 돌아가기</span>
      </button>

      {/* Thumbnail Generator */}
      {analysis && selectedTopic && (
        <ThumbnailGenerator topic={selectedTopic.title} tone={analysis.tone} />
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-950/50 border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">생성된 대본</h2>
            <p className="text-indigo-400 font-medium">{selectedTopic?.title}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isCopied 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              <span>{isCopied ? '복사됨!' : '대본 복사'}</span>
            </button>
            <button
              onClick={() => downloadAsWord(selectedTopic?.title || '대본', generatedScript)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors border border-blue-700"
              title="Word 문서로 다운로드"
            >
              <FileText size={18} />
              <span>Word</span>
            </button>
            <button
              onClick={() => downloadAsPDF(selectedTopic?.title || '대본', generatedScript)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors border border-red-700"
              title="PDF로 다운로드"
            >
              <FileDown size={18} />
              <span>PDF</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={18} />
              <span>새 프로젝트</span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 bg-slate-900">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-300 prose-p:text-slate-300 prose-strong:text-white">
            <div className="whitespace-pre-wrap leading-relaxed font-light">
              {generatedScript.split('**').map((part, index) => 
                index % 2 === 1 ? <strong key={index} className="text-white font-bold">{part}</strong> : part
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleReset}>
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Youtube className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Tube<span className="text-indigo-500">Script</span> AI
            </h1>
          </div>
          <ApiKeyManager onApiKeySet={handleApiKeySet} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Text (only on input) */}
          {step === AppStep.INPUT && (
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                아이디어를 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  바이럴 유튜브 대본으로 완성하세요
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                AI 기반 분석 및 고효율 대본 작성 도구입니다. <br/>
                생각나는 아이디어를 입력하면 촬영 준비가 완료된 대본을 만들어 드립니다.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          {step !== AppStep.INPUT && <StepIndicator currentStep={step} />}

          {/* Conditional Rendering */}
          {step === AppStep.INPUT && renderInput()}
          {step === AppStep.ANALYZING && <LoadingSpinner message="글쓰기 스타일을 분석하고 아이디어를 브레인스토밍 중입니다..." />}
          {step === AppStep.SELECTION && renderSelection()}
          {step === AppStep.GENERATING && <LoadingSpinner message={`"${selectedTopic?.title}" 대본을 작성 중입니다...`} />}
          {step === AppStep.RESULT && renderResult()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} TubeScript AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;