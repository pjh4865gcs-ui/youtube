import React, { useState } from 'react';
import { Network, ChevronDown, ChevronRight, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface MindMapNode {
  id: string;
  title: string;
  children: MindMapNode[];
  isExpanded: boolean;
  type: 'hook' | 'intro' | 'body' | 'outro' | 'point' | 'detail';
  isGuide?: boolean; // 가이드 노드 표시
  guideSuffix?: string; // 가이드 텍스트 (워터마크)
}

interface ScriptFlowMapProps {
  onStructureChange?: (structure: MindMapNode) => void;
}

export const ScriptFlowMap: React.FC<ScriptFlowMapProps> = ({ onStructureChange }) => {
  const [rootNode, setRootNode] = useState<MindMapNode>({
    id: 'root',
    title: '유튜브 대본 구조',
    isExpanded: true,
    type: 'hook',
    children: [
      {
        id: 'hook',
        title: '🎯 HOOK',
        guideSuffix: '(0-30초): 시청자 사로잡기',
        isExpanded: true,
        type: 'hook',
        isGuide: true,
        children: [
          { id: 'hook-1', title: '충격적인 사실이나 질문', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'hook-2', title: '시청자의 문제점 제시', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'hook-3', title: '영상의 가치 약속', children: [], isExpanded: false, type: 'point', isGuide: true }
        ]
      },
      {
        id: 'intro',
        title: '📢 INTRO',
        guideSuffix: '(30초-1분): 주제 소개',
        isExpanded: true,
        type: 'intro',
        isGuide: true,
        children: [
          { id: 'intro-1', title: '자기소개 (간단히)', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'intro-2', title: '영상 주제 명확히 밝히기', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'intro-3', title: '구성 미리보기 (타임스탬프)', children: [], isExpanded: false, type: 'point', isGuide: true }
        ]
      },
      {
        id: 'body',
        title: '📚 BODY',
        guideSuffix: ': 본문 내용',
        isExpanded: true,
        type: 'body',
        isGuide: true,
        children: [
          {
            id: 'point-1',
            title: '핵심 포인트 1',
            isExpanded: true,
            type: 'point',
            children: [
              { id: 'detail-1-1', title: '구체적 설명', children: [], isExpanded: false, type: 'detail', isGuide: true },
              { id: 'detail-1-2', title: '예시 또는 사례', children: [], isExpanded: false, type: 'detail', isGuide: true },
              { id: 'detail-1-3', title: '시각 자료 활용', children: [], isExpanded: false, type: 'detail', isGuide: true }
            ]
          },
          {
            id: 'point-2',
            title: '핵심 포인트 2',
            isExpanded: true,
            type: 'point',
            children: [
              { id: 'detail-2-1', title: '구체적 설명', children: [], isExpanded: false, type: 'detail', isGuide: true },
              { id: 'detail-2-2', title: '예시 또는 사례', children: [], isExpanded: false, type: 'detail', isGuide: true }
            ]
          },
          {
            id: 'point-3',
            title: '핵심 포인트 3',
            isExpanded: true,
            type: 'point',
            children: [
              { id: 'detail-3-1', title: '구체적 설명', children: [], isExpanded: false, type: 'detail', isGuide: true },
              { id: 'detail-3-2', title: '예시 또는 사례', children: [], isExpanded: false, type: 'detail', isGuide: true }
            ]
          }
        ]
      },
      {
        id: 'outro',
        title: '🎬 OUTRO & CTA',
        guideSuffix: ': 마무리',
        isExpanded: true,
        type: 'outro',
        isGuide: true,
        children: [
          { id: 'outro-1', title: '핵심 내용 요약', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'outro-2', title: '시청자에게 질문 던지기', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'outro-3', title: '구독/좋아요/알림 요청', children: [], isExpanded: false, type: 'point', isGuide: true },
          { id: 'outro-4', title: '다음 영상 예고', children: [], isExpanded: false, type: 'point', isGuide: true }
        ]
      }
    ]
  });

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const toggleNode = (nodeId: string, node: MindMapNode = rootNode): MindMapNode => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    return {
      ...node,
      children: node.children.map(child => toggleNode(nodeId, child))
    };
  };

  const addNode = (parentId: string, node: MindMapNode = rootNode): MindMapNode => {
    if (node.id === parentId) {
      const newNode: MindMapNode = {
        id: `${parentId}-new-${Date.now()}`,
        title: '새 항목 (클릭하여 수정)',
        children: [],
        isExpanded: false,
        type: node.type === 'body' ? 'point' : 'detail'
      };
      return {
        ...node,
        children: [...node.children, newNode],
        isExpanded: true
      };
    }
    return {
      ...node,
      children: node.children.map(child => addNode(parentId, child))
    };
  };

  const deleteNode = (nodeId: string, node: MindMapNode = rootNode): MindMapNode => {
    return {
      ...node,
      children: node.children
        .filter(child => child.id !== nodeId)
        .map(child => deleteNode(nodeId, child))
    };
  };

  const updateNodeTitle = (nodeId: string, newTitle: string, node: MindMapNode = rootNode): MindMapNode => {
    if (node.id === nodeId) {
      // 가이드 노드는 guideSuffix를 보존
      return { ...node, title: newTitle };
    }
    return {
      ...node,
      children: node.children.map(child => updateNodeTitle(nodeId, newTitle, child))
    };
  };

  const startEdit = (nodeId: string, currentTitle: string) => {
    setEditingNode(nodeId);
    setEditText(currentTitle);
  };

  const saveEdit = () => {
    if (editingNode && editText.trim()) {
      const updated = updateNodeTitle(editingNode, editText, rootNode);
      setRootNode(updated);
      onStructureChange?.(updated);
    }
    setEditingNode(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditText('');
  };

  const handleToggle = (nodeId: string) => {
    const updated = toggleNode(nodeId);
    setRootNode(updated);
  };

  const handleAdd = (parentId: string) => {
    const updated = addNode(parentId);
    setRootNode(updated);
    onStructureChange?.(updated);
  };

  const handleDelete = (nodeId: string) => {
    const updated = deleteNode(nodeId);
    setRootNode(updated);
    onStructureChange?.(updated);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'hook': return 'bg-red-900/30 border-red-500/50 text-red-200';
      case 'intro': return 'bg-blue-900/30 border-blue-500/50 text-blue-200';
      case 'body': return 'bg-green-900/30 border-green-500/50 text-green-200';
      case 'outro': return 'bg-purple-900/30 border-purple-500/50 text-purple-200';
      case 'point': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200';
      case 'detail': return 'bg-slate-800 border-slate-600 text-slate-300';
      default: return 'bg-slate-800 border-slate-600 text-slate-300';
    }
  };

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isEditing = editingNode === node.id;
    const indent = level * 24;

    return (
      <div key={node.id} className="animate-in fade-in slide-in-from-left duration-200">
        <div 
          className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:shadow-lg mb-2 ${getNodeColor(node.type)}`}
          style={{ marginLeft: `${indent}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => handleToggle(node.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {node.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          
          {!hasChildren && <div className="w-7" />}
          
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    cancelEdit();
                  }
                  // Delete와 Backspace는 기본 동작 허용 (텍스트 삭제)
                }}
                className="flex-1 bg-slate-950 text-slate-100 border border-slate-600 rounded px-3 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button onClick={saveEdit} className="p-1 hover:bg-green-600 rounded text-green-400">
                <Check size={18} />
              </button>
              <button onClick={cancelEdit} className="p-1 hover:bg-red-600 rounded text-red-400">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 font-medium">
                {node.isGuide ? (
                  <span className="text-slate-400 select-none cursor-not-allowed">
                    {node.title}
                  </span>
                ) : (
                  node.title
                )}
                {node.guideSuffix && (
                  <span className="text-slate-500 font-normal ml-1 select-none">{node.guideSuffix}</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {!node.isGuide && (
                  <button
                    onClick={() => startEdit(node.id, node.title)}
                    className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="수정"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {node.id !== 'root' && !node.isGuide && (
                  <button
                    onClick={() => handleDelete(node.id)}
                    className="p-1 hover:bg-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleAdd(node.id)}
                  className="p-1 hover:bg-green-600 rounded transition-colors"
                  title="하위 항목 추가"
                >
                  <Plus size={16} />
                </button>
              </div>
            </>
          )}
        </div>
        
        {hasChildren && node.isExpanded && (
          <div className="ml-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const exportToText = () => {
    const nodeToText = (node: MindMapNode, level: number = 0): string => {
      const indent = '  '.repeat(level);
      let text = `${indent}${node.title}\n`;
      if (node.children.length > 0) {
        text += node.children.map(child => nodeToText(child, level + 1)).join('');
      }
      return text;
    };
    return nodeToText(rootNode);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Network className="mr-2 text-indigo-400" size={24} />
          대본 논리 흐름도 (30초 룰 적용)
        </h3>
        <button
          onClick={() => {
            const text = exportToText();
            navigator.clipboard.writeText(text);
            alert('구조가 클립보드에 복사되었습니다!');
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
        >
          구조 복사
        </button>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 mb-4 border border-slate-800">
        <p className="text-slate-400 text-sm mb-2">
          💡 <strong>30초 룰</strong>: 처음 30초 안에 시청자를 사로잡아야 합니다.
        </p>
        <p className="text-slate-500 text-xs">
          회색으로 표시된 가이드 항목은 편집할 수 없습니다. 
          + 버튼으로 새 항목을 추가하고, 추가한 항목은 자유롭게 편집/삭제할 수 있습니다.
        </p>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar group">
        {renderNode(rootNode)}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .group:hover .group-hover\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
