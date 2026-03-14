import { useState } from 'react';
import { Plus, Trash2, X, BookOpen, Heart, Dices, AlertTriangle } from 'lucide-react';

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customQuestions: {
    truth: string[];
    dare: string[];
    punishment: string[];
  };
  onAddQuestion: (type: 'truth' | 'dare' | 'punishment', question: string) => void;
  onRemoveQuestion: (type: 'truth' | 'dare' | 'punishment', index: number) => void;
}

export default function CustomQuestionModal({
  isOpen,
  onClose,
  customQuestions,
  onAddQuestion,
  onRemoveQuestion,
}: CustomQuestionModalProps) {
  const [activeTab, setActiveTab] = useState<'truth' | 'dare' | 'punishment'>('truth');
  const [newQuestion, setNewQuestion] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newQuestion.trim()) {
      onAddQuestion(activeTab, newQuestion.trim());
      setNewQuestion('');
    }
  };

  const tabs = [
    { id: 'truth', label: '真心话', icon: Heart, color: 'text-pink-500' },
    { id: 'dare', label: '大冒险', icon: Dices, color: 'text-purple-500' },
    { id: 'punishment', label: '惩罚', icon: AlertTriangle, color: 'text-amber-500' },
  ] as const;

  const currentQuestions = activeTab === 'truth' ? customQuestions.truth : 
                           activeTab === 'dare' ? customQuestions.dare : 
                           customQuestions.punishment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[80vh] overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-[var(--text-primary)]">自定义题库</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 hover:bg-[var(--bg-tertiary)] rounded">
            <X className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-slate-500 text-[var(--text-tertiary)] hover:text-slate-700 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Question List */}
        <div className="p-4 overflow-y-auto max-h-48">
          {currentQuestions.length === 0 ? (
            <p className="text-center text-slate-400 text-[var(--text-muted)] text-sm py-4">
              还没有自定义题目，快添加吧！
            </p>
          ) : (
            <ul className="space-y-2">
              {currentQuestions.map((q, index) => (
                <li key={index} className="flex items-start gap-2 p-2 bg-slate-50 bg-[var(--bg-tertiary)] rounded-lg group">
                  <span className="flex-1 text-sm text-slate-700 text-[var(--text-secondary)]">{q}</span>
                  <button
                    onClick={() => onRemoveQuestion(activeTab, index)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:bg-red-900/30 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add New */}
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={`添加新的${activeTab === 'truth' ? '真心话' : activeTab === 'dare' ? '大冒险' : '惩罚'}...`}
              className="flex-1 px-3 py-2 text-sm border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            />
            <button
              onClick={handleAdd}
              disabled={!newQuestion.trim()}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-[var(--text-muted)] mt-2">
            自定义题目会与预设题目混合使用，按 Enter 快速添加
          </p>
        </div>
      </div>
    </div>
  );
}