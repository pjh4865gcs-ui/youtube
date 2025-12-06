import React, { useState } from 'react';
import { Sparkles, PenTool, ArrowRight, RotateCcw, Copy, CheckCircle2, Youtube, Wand2 } from 'lucide-react';
import { analyzeScriptAndGetTopics, generateFullScript, setApiKey } from './services/geminiService';
import { AppStep, ScriptAnalysis, TopicSuggestion } from './types';
import { StepIndicator } from './components/StepIndicator';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ApiKeyManager } from './components/ApiKeyManager';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [inputScript, setInputScript] = useState('');
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicSuggestion | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

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
      const script = await generateFullScript(topic.title, analysis.tone, analysis.targetAudience);
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
    setAnalysis(null);
    setSelectedTopic(null);
    setGeneratedScript('');
  };

  // Render Helpers
  const renderInput = () => (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      )}
    </div>
  );

  const renderResult = () => (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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