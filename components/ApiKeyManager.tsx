import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, X } from 'lucide-react';
import { setApiKey } from '../services/geminiService';
import { setHollywoodApiKey } from '../services/hollywoodArchitect';

const ApiKeyManager: React.FC = () => {
  const [apiKey, setApiKeyState] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setSavedKey(stored);
      setApiKey(stored);
      setHollywoodApiKey(stored);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('API 키를 입력해 주세요.');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    setApiKey(apiKey);
    setHollywoodApiKey(apiKey);
    setSavedKey(apiKey);
    setIsEditing(false);
    alert('API 키가 저장되었습니다.');
  };

  const handleDelete = () => {
    if (confirm('저장된 API 키를 삭제하시겠습니까?')) {
      localStorage.removeItem('gemini_api_key');
      setApiKeyState('');
      setSavedKey(null);
      setIsEditing(false);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  if (savedKey && !isEditing) {
    return (
      <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
        <Key className="w-4 h-4 text-green-400" />
        <span className="text-sm text-slate-300 font-mono">
          {showKey ? savedKey : maskKey(savedKey)}
        </span>
        <button
          onClick={() => setShowKey(!showKey)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="text-slate-400 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
      <Key className="w-4 h-4 text-slate-400" />
      <input
        type={showKey ? 'text' : 'password'}
        value={apiKey}
        onChange={(e) => setApiKeyState(e.target.value)}
        placeholder="Gemini API 키 입력"
        className="bg-transparent text-sm text-slate-300 outline-none flex-1 min-w-[200px] font-mono"
      />
      <button
        onClick={() => setShowKey(!showKey)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        onClick={handleSave}
        className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors"
      >
        <Save className="w-4 h-4" />
        저장
      </button>
      {isEditing && (
        <button
          onClick={() => {
            setIsEditing(false);
            setApiKeyState(savedKey || '');
          }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ApiKeyManager;
