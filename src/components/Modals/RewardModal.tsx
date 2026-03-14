import { Heart, CircleDollarSign, Sparkles, Star } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  isReadOnly?: boolean;
}

export default function RewardModal({ isOpen, onClose, amount, isReadOnly }: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Main Popup Container */}
      <div className="relative w-full max-w-[480px] bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl overflow-hidden border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        {/* Festive Top Section with Gradient Background */}
        <div className="relative h-64 w-full bg-gradient-to-b from-[#ec5b13]/20 to-transparent from-[#ec5b13]/10 flex flex-col items-center justify-center overflow-hidden">
          {/* Sparkle Background Decorative Icons */}
          <Sparkles className="absolute top-10 left-10 text-[#ec5b13]/30 w-10 h-10" />
          <Star className="absolute bottom-12 right-12 text-[#ec5b13]/40 w-8 h-8 fill-[#ec5b13]/40" />
          <Sparkles className="absolute top-16 right-16 text-[#ec5b13]/20 w-12 h-12" />

          {/* Large Gold Coin Component */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Coin Glow */}
            <div className="absolute w-40 h-40 bg-[#ec5b13]/20 rounded-full blur-3xl"></div>
            {/* The Main Coin */}
            <div className="relative w-32 h-32 bg-gradient-to-tr from-[#ec5b13] to-yellow-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
              <CircleDollarSign className="text-white w-20 h-20" />
              {/* Sparkle Overlays */}
              <Sparkles className="absolute -top-2 -right-2 text-white w-6 h-6 drop-shadow-md" />
            </div>
          </div>

          {/* Confetti-like bits */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#ec5b13] rounded-full opacity-50"></div>
            <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-yellow-400 rotate-45 opacity-60"></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-4 bg-[#ec5b13]/40 rounded-full -rotate-12"></div>
          </div>
        </div>

        {/* Text Content Area */}
        <div className="px-8 pb-8 pt-2 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 text-[var(--text-primary)] tracking-tight mb-2">
            +{amount} 金币
          </h1>
          <p className="text-slate-600 text-[var(--text-tertiary)] text-lg leading-relaxed mb-8">
            运气不错！你获得了一份特别奖励。
          </p>

          {/* Progress Bar / Visual Detail */}
          <div className="w-full h-2 bg-slate-100 bg-[var(--bg-tertiary)] rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-[#ec5b13] w-3/4 rounded-full"></div>
          </div>

          {/* Festive Button */}
          {!isReadOnly ? (
            <>
              <button
                onClick={onClose}
                className="group relative w-full flex items-center justify-center h-14 bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#ec5b13]/25 active:scale-[0.98]"
              >
                <span className="truncate">太棒了！</span>
                <Heart className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform fill-white" />
              </button>

              {/* Secondary Action */}
              <button
                onClick={onClose}
                className="mt-4 text-slate-500 text-[var(--text-tertiary)] font-medium hover:text-[#ec5b13] transition-colors text-sm"
              >
                查看钱包
              </button>
            </>
          ) : (
            <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
              等待对方领取奖励...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
