import React, { useState, useEffect } from 'react';
import { Key, Check, X, Eye, EyeOff } from 'lucide-react';

interface ApiKeyManagerProps {
  onApiKeySet: (apiKey: string) => void;
}

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) {
      setSavedKey(stored);
      onApiKeySet(stored);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setSavedKey(apiKey.trim());
      onApiKeySet(apiKey.trim());
      setIsEditing(false);
      setApiKey('');
    }
  };

  const handleRemove = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setSavedKey(null);
    setApiKey('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setApiKey('');
    if (savedKey) {
      setIsEditing(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}${'•'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  if (!isEditing && savedKey) {
    return (
      <div className="flex items-center justify-end space-x-2">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
          <Key size={16} className="text-green-500" />
          <span className="text-slate-400 text-sm font-mono">
            {showKey ? savedKey : maskApiKey(savedKey)}
          </span>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          변경
        </button>
        <button
          onClick={handleRemove}
          className="px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg text-sm transition-colors"
        >
          삭제
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <div className="relative">
        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type={showKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Gemini API 키 입력"
          className="w-80 bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-10 py-2 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm transition-colors flex items-center space-x-1"
      >
        <Check size={16} />
        <span>저장</span>
      </button>
      {savedKey && (
        <button
          onClick={handleCancel}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors flex items-center space-x-1"
        >
          <X size={16} />
          <span>취소</span>
        </button>
      )}
    </div>
  );
};
