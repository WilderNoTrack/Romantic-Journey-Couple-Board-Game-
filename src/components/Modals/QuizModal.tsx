import { X, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => void;
  onJudge: (isMatch: boolean) => void;
  question: string;
  himName: string;
  herName: string;
  isReadOnly?: boolean;
  sharedState?: any;
  onStateChange?: (state: any) => void;
}

export default function QuizModal({ isOpen, onClose, onSubmit, onJudge, question, himName, herName, isReadOnly, sharedState, onStateChange }: QuizModalProps) {
  const [localAnswer, setLocalAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Sync state
  const state = sharedState || {
    himAnswer: null,
    herAnswer: null,
    stage: 'answering' // 'answering' | 'judging' | 'result'
  };

  useEffect(() => {
    if (isOpen) {
      setLocalAnswer('');
      setHasSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isReadOnly && !sharedState) {
      if (onStateChange) {
        onStateChange({
          himAnswer: null,
          herAnswer: null,
          stage: 'answering',
          question: question
        });
      }
    }
  }, [isOpen, isReadOnly]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (localAnswer.trim()) {
      onSubmit(localAnswer.trim());
      setHasSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-purple-100 bg-[var(--bg-purple)] text-purple-500">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)]">默契大考验</h2>
          <p className="mt-2 text-lg font-medium text-slate-700 text-[var(--text-secondary)]">{question}</p>
        </div>

        <div className="px-6 py-4">
          {state.stage === 'answering' && (
            <div className="space-y-4">
              {!hasSubmitted ? (
                <>
                  <input
                    type="text"
                    value={localAnswer}
                    onChange={(e) => setLocalAnswer(e.target.value)}
                    placeholder="输入你的答案..."
                    className="w-full p-3 border border-slate-200 border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!localAnswer.trim()}
                    className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    提交答案
                  </button>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500 text-[var(--text-tertiary)] font-medium">
                  等待对方提交答案...
                </div>
              )}
            </div>
          )}

          {state.stage === 'judging' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 bg-[var(--bg-tertiary)] p-4 rounded-xl text-center border border-slate-200 border-[var(--border-primary)]">
                  <p className="text-xs text-slate-400 text-[var(--text-muted)] font-bold mb-1">{himName || '他'}的答案</p>
                  <p className="text-lg font-medium text-slate-800 text-[var(--text-primary)]">{state.himAnswer || '...'}</p>
                </div>
                <div className="bg-slate-50 bg-[var(--bg-tertiary)] p-4 rounded-xl text-center border border-slate-200 border-[var(--border-primary)]">
                  <p className="text-xs text-slate-400 text-[var(--text-muted)] font-bold mb-1">{herName || '她'}的答案</p>
                  <p className="text-lg font-medium text-slate-800 text-[var(--text-primary)]">{state.herAnswer || '...'}</p>
                </div>
              </div>
              
              {!isReadOnly ? (
                <div className="space-y-3">
                  <p className="text-center text-sm font-bold text-slate-600 text-[var(--text-tertiary)]">你们的答案一致吗？</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onJudge(true)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> 算一致！
                    </button>
                    <button
                      onClick={() => onJudge(false)}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> 不一致
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
                  等待对方判定...
                </div>
              )}
            </div>
          )}

          {state.stage === 'result' && (
            <div className="space-y-6 text-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 bg-[var(--bg-tertiary)] p-4 rounded-xl text-center border border-slate-200 border-[var(--border-primary)]">
                  <p className="text-xs text-slate-400 text-[var(--text-muted)] font-bold mb-1">{himName || '他'}的答案</p>
                  <p className="text-lg font-medium text-slate-800 text-[var(--text-primary)]">{state.himAnswer}</p>
                </div>
                <div className="bg-slate-50 bg-[var(--bg-tertiary)] p-4 rounded-xl text-center border border-slate-200 border-[var(--border-primary)]">
                  <p className="text-xs text-slate-400 text-[var(--text-muted)] font-bold mb-1">{herName || '她'}的答案</p>
                  <p className="text-lg font-medium text-slate-800 text-[var(--text-primary)]">{state.herAnswer}</p>
                </div>
              </div>
              
              <div className="py-4">
                {state.isMatch ? (
                  <div className="text-green-500 space-y-2">
                    <CheckCircle className="w-12 h-12 mx-auto" />
                    <p className="text-xl font-bold">默契满分！</p>
                    <p className="text-sm text-slate-600 text-[var(--text-tertiary)]">双方各获得 30 金币奖励</p>
                  </div>
                ) : (
                  <div className="text-red-500 space-y-2">
                    <XCircle className="w-12 h-12 mx-auto" />
                    <p className="text-xl font-bold">哎呀，不一致</p>
                    <p className="text-sm text-slate-600 text-[var(--text-tertiary)]">看来还需要多加了解哦~</p>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-900 bg-[var(--bg-secondary)] text-white py-3 rounded-xl font-bold hover:bg-slate-800 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                关闭
              </button>
            </div>
          )}
        </div>

        {(state.stage === 'answering' || state.stage === 'result') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 text-[var(--text-muted)] hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
