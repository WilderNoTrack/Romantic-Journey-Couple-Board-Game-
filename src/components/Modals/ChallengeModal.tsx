import { Heart, RefreshCw, X, AlertCircle, CircleDollarSign } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../Toast';
import { getQuestions } from '../../data/questions';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
  hasShield?: boolean;
  onConsumeShield?: () => void;
  isReadOnly?: boolean;
  sharedState?: any;
  onStateChange?: (state: any) => void;
  customDares?: string[];
  coins?: number;
  onSpendCoins?: (amount: number) => void;
  boardLevel?: number;
  questionBankId?: string;
  customQuestionBanks?: {
    truth: string[];
    dare: string[];
    punishment: string[];
  };
}

export default function ChallengeModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  hasShield,
  onConsumeShield,
  isReadOnly,
  sharedState,
  onStateChange,
  customDares = [],
  coins = 0,
  onSpendCoins,
  boardLevel = 1,
  questionBankId = 'normal',
  customQuestionBanks = { truth: [], dare: [], punishment: [] },
}: ChallengeModalProps) {
  const toast = useToast();
  const spentCoinsRef = useRef(0);
  const [localState, setLocalState] = useState({
    activeTab: 'truth' as 'truth' | 'dare',
    currentTruthQuestion: '',
    currentDareQuestion: '',
    showPunishment: false,
    currentPunishment: ''
  });

  const availableCoins = coins - spentCoinsRef.current;
  
  const isSmMode = questionBankId === 'sm';
  const isLongDistanceMode = questionBankId === 'longdistance';
  const baseQuestions = getQuestions(boardLevel, isSmMode, undefined, isLongDistanceMode);
  
  const hasCustomQuestions = customQuestionBanks && customQuestionBanks.truth && customQuestionBanks.truth.length > 0;
  const truthQuestions = hasCustomQuestions 
    ? customQuestionBanks.truth 
    : [...baseQuestions.truth, ...(customQuestionBanks?.truth || [])];
  const dareQuestions = hasCustomQuestions 
    ? customQuestionBanks.dare 
    : [...baseQuestions.dare, ...(customQuestionBanks?.dare || []), ...customDares];
  const punishments = hasCustomQuestions 
    ? customQuestionBanks.punishment 
    : [...baseQuestions.punishment, ...(customQuestionBanks?.punishment || [])];

  useEffect(() => {
    if (isOpen) {
      spentCoinsRef.current = 0;
    }
  }, [isOpen]);

  const state = isReadOnly && sharedState ? sharedState : localState;

  const updateState = (newState: Partial<typeof localState>) => {
    if (isReadOnly) return;
    const updated = { ...state, ...newState };
    setLocalState(updated);
    if (onStateChange) onStateChange(updated);
  };

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen && !isReadOnly) {
      const initial = {
        activeTab: 'truth' as 'truth' | 'dare',
        currentTruthQuestion: truthQuestions[Math.floor(Math.random() * truthQuestions.length)],
        currentDareQuestion: dareQuestions[Math.floor(Math.random() * dareQuestions.length)],
        showPunishment: false,
        currentPunishment: ''
      };
      setLocalState(initial);
      if (onStateChange) onStateChange(initial);
    }
  }, [isOpen, isReadOnly]);

  const getRandomDare = () => {
    // 30% chance to pick a custom dare if available
    if (customDares.length > 0 && Math.random() < 0.3) {
      return customDares[Math.floor(Math.random() * customDares.length)];
    }
    return dareQuestions[Math.floor(Math.random() * dareQuestions.length)];
  };

  const handleTabChange = (tab: 'truth' | 'dare') => {
    if (isReadOnly) return;
    updateState({
      activeTab: tab
    });
  };

  const handleChangeQuestion = () => {
    if (isReadOnly) return;
    if (availableCoins < 30) {
      toast.showToast('金币不足！换一个需要 30 金币', 'error');
      return;
    }
    
    if (state.activeTab === 'truth') {
      let newQuestion = state.currentTruthQuestion;
      let attempts = 0;
      while (newQuestion === state.currentTruthQuestion && attempts < 10) {
        newQuestion = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
        attempts++;
      }
      updateState({ currentTruthQuestion: newQuestion });
    } else {
      let newQuestion = state.currentDareQuestion;
      let attempts = 0;
      while (newQuestion === state.currentDareQuestion && attempts < 10) {
        newQuestion = getRandomDare();
        attempts++;
      }
      updateState({ currentDareQuestion: newQuestion });
    }
    
    spentCoinsRef.current += 30;
    if (onSpendCoins) onSpendCoins(30);
  };

  const handleSkipClick = () => {
    if (isReadOnly) return;
    if (hasShield && onConsumeShield) {
      onConsumeShield();
      onSkip();
      toast.showToast('甜心护盾生效，免受惩罚！', 'success');
    } else {
      updateState({
        showPunishment: true,
        currentPunishment: punishments[Math.floor(Math.random() * punishments.length)]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      {/* Challenge Popup Container */}
      <div className="relative w-full max-w-md overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        {/* Top Nav Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        {!state.showPunishment ? (
          <>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary">
                <Heart className="w-6 h-6 fill-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)]">心动挑战</h2>
              <p className="mt-1 text-sm text-slate-500 text-[var(--text-tertiary)]">让甜蜜升温的小游戏</p>
            </div>

            {/* Tabs Section */}
            <div className="px-6 pb-2">
              <div className="flex p-1 space-x-1 rounded-xl bg-slate-100 bg-[var(--bg-tertiary)]">
                <button 
                  onClick={() => handleTabChange('truth')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'truth' ? 'bg-white bg-[var(--bg-secondary)] text-primary shadow-sm' : 'text-slate-500 text-[var(--text-tertiary)] hover:text-primary'} ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  真心话
                </button>
                <button 
                  onClick={() => handleTabChange('dare')}
                  disabled={isReadOnly}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${state.activeTab === 'dare' ? 'bg-white bg-[var(--bg-secondary)] text-primary shadow-sm' : 'text-slate-500 text-[var(--text-tertiary)] hover:text-primary'} ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  大冒险
                </button>
              </div>
            </div>

            {/* Central Challenge Card */}
            <div className="px-6 py-6">
              <div className="relative group">
                {/* Soft Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col items-center justify-center p-8 text-center bg-white bg-[var(--bg-tertiary)] border border-primary/5 border-[var(--border-primary)] rounded-xl min-h-[220px]">
                  <div className="absolute top-4 left-4 text-primary/10 text-4xl font-serif">"</div>

                  {/* Image placeholder for decorative mood */}
                  <div className="mb-6 w-full h-32 overflow-hidden rounded-lg relative">
                    <img
                      className="w-full h-full object-cover"
                      alt="Soft pink romantic background with blurred hearts"
                      src="/avatars/unnamed.png"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white from-slate-700 to-transparent"></div>
                  </div>

                  <p className="text-lg font-medium leading-relaxed text-slate-800 text-[var(--text-primary)]">
                    {state.activeTab === 'truth' ? state.currentTruthQuestion : state.currentDareQuestion}
                  </p>

                  {!isReadOnly && (
                    <button 
                      onClick={handleChangeQuestion}
                      disabled={availableCoins < 30}
                      className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity ${availableCoins >= 30 ? 'text-primary hover:opacity-80' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      换一个
                      <span className="flex items-center gap-0.5 text-yellow-600">
                        <CircleDollarSign className="w-3 h-3" />30
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 py-6 bg-slate-50/50 bg-[var(--bg-tertiary)]/50 flex flex-col gap-3">
              {!isReadOnly ? (
                <>
                  <button
                    onClick={onComplete}
                    className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    挑战完成
                  </button>
                  <button
                    onClick={handleSkipClick}
                    className="w-full flex items-center justify-center h-12 px-6 font-bold text-slate-600 text-[var(--text-secondary)] transition-all bg-white bg-[var(--bg-secondary)] border border-slate-200 border-[var(--border-primary)] rounded-xl hover:bg-slate-50 hover:bg-[var(--bg-secondary)] active:scale-[0.98]"
                  >
                    {hasShield ? '使用护盾跳过' : '跳过 (接受惩罚)'}
                  </button>
                </>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
                  等待对方操作...
                </div>
              )}
            </div>
          </>
        ) : (
          /* Punishment Screen */
          <>
            <div className="px-6 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100 bg-red-900/30 text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)] mb-2">接受惩罚吧！</h2>
              <p className="text-sm text-slate-500 text-[var(--text-tertiary)] mb-8">既然选择了跳过，就要愿赌服输哦~</p>
              
              <div className="p-6 bg-red-50 bg-red-900/20 border border-red-100 border-red-800 rounded-xl mb-8">
                <p className="text-xl font-bold text-red-600 text-red-400">
                  {state.currentPunishment}
                </p>
              </div>
            </div>

            <div className="px-6 py-6 bg-slate-50/50 bg-[var(--bg-tertiary)]/50 flex flex-col gap-3">
              {!isReadOnly ? (
                <button
                  onClick={onSkip}
                  className="w-full flex items-center justify-center h-12 px-6 font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]"
                >
                  我认罚！(关闭)
                </button>
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
                  等待对方接受惩罚...
                </div>
              )}
            </div>
          </>
        )}

        {/* Close Button */}
        {!isReadOnly && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
