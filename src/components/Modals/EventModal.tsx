import { Star, Heart, Sparkles, Shuffle, Coins, Lock, Repeat, X } from 'lucide-react';
import { SPECIAL_EVENTS } from '../../data/events';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  isReadOnly?: boolean;
}

export default function EventModal({ isOpen, onClose, eventId, isReadOnly }: EventModalProps) {
  if (!isOpen) return null;

  const event = SPECIAL_EVENTS.find(e => e.id === eventId) || SPECIAL_EVENTS[0];

  const getIcon = () => {
    switch (event.icon) {
      case 'star': return <Star className="w-8 h-8 text-white" />;
      case 'heart': return <Heart className="w-8 h-8 text-white fill-white" />;
      case 'sparkles': return <Sparkles className="w-8 h-8 text-white" />;
      case 'shuffle': return <Shuffle className="w-8 h-8 text-white" />;
      case 'coins': return <Coins className="w-8 h-8 text-white" />;
      case 'lock': return <Lock className="w-8 h-8 text-white" />;
      case 'repeat': return <Repeat className="w-8 h-8 text-white" />;
      case 'rainbow': return <Sparkles className="w-8 h-8 text-white" />;
      default: return <Sparkles className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className={`h-32 ${event.color} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-white/30" />
              </div>
            ))}
          </div>
          <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-xl">
            {getIcon()}
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            ✨ 特殊事件 ✨
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)] mb-2">{event.title}</h2>
          <p className="text-lg font-medium text-slate-600 text-[var(--text-tertiary)]">{event.desc}</p>
        </div>

        <div className="px-6 pb-6">
          {!isReadOnly ? (
            <button
              onClick={onClose}
              className={`w-full ${event.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg`}
            >
              太棒了！
            </button>
          ) : (
            <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
              等待对方确认...
            </div>
          )}
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