import { Star, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-slate-900/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      <div className={`relative w-full max-w-sm overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-2xl shadow-2xl border border-yellow-200 border-[var(--border-primary)] transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
        <div className="relative h-48 w-full bg-gradient-to-b from-yellow-400 via-amber-400 to-orange-400 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-200/60" />
              </div>
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm border-4 border-white/50 shadow-xl animate-bounce">
              <Star className="w-10 h-10 text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="px-6 py-6 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-2">
            升级啦！
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl font-black text-amber-500">Lv.{level}</span>
          </div>
          <p className="text-slate-600 text-[var(--text-tertiary)] mb-4">
            恭喜！解锁了新的道具购买权限！
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-[var(--text-muted)]">
            <Sparkles className="w-3 h-3" />
            <span>继续加油，探索更多浪漫~</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}