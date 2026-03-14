import { Gift, Star, Heart, Utensils, Shield, Film, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface FinishBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (boxIndex: number) => void;
  isReadOnly?: boolean;
}

export default function FinishBoxModal({ isOpen, onClose, onSelect, isReadOnly }: FinishBoxModalProps) {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  if (!isOpen) return null;

  const boxes = [
    { id: 0, title: '浪漫大餐', desc: '对方请客吃一顿大餐！', icon: Utensils, color: 'bg-rose-500' },
    { id: 1, title: '免死金牌', desc: '免除一次家务！', icon: Shield, color: 'bg-blue-500' },
    { id: 2, title: '神秘礼物', desc: '对方需要为你准备一份小礼物！', icon: Gift, color: 'bg-purple-500' },
    { id: 3, title: '专属按摩', desc: '对方为你按摩30分钟！', icon: Heart, color: 'bg-pink-500' },
    { id: 4, title: '电影之夜', desc: '对方陪你看一部电影！', icon: Film, color: 'bg-indigo-500' },
    { id: 5, title: '深情告白', desc: '对方当面说10句情话！', icon: Heart, color: 'bg-red-500' },
    { id: 6, title: '游戏时间', desc: '对方陪你玩1小时游戏！', icon: Gamepad2, color: 'bg-emerald-500' },
    { id: 7, title: '心愿达成', desc: '对方满足你一个小愿望！', icon: Star, color: 'bg-amber-500' },
  ];

  const handleSelect = (index: number) => {
    if (isReadOnly || revealed) return;
    setSelectedBox(index);
    setRevealed(true);
    setTimeout(() => {
      onSelect(index);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-yellow-500/30 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-8 pb-4 text-center bg-gradient-to-b from-yellow-50 from-yellow-900/20 to-white to-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-yellow-100 bg-[var(--bg-yellow)] text-yellow-500 shadow-inner">
            <Star className="w-8 h-8 fill-yellow-500" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 text-[var(--text-primary)] mb-2">终点大奖盲盒</h2>
          <p className="text-lg font-medium text-slate-600 text-[var(--text-tertiary)]">恭喜到达终点！请选择一个盲盒作为奖励</p>
        </div>

        <div className="px-6 py-8 grid grid-cols-4 gap-4">
          {boxes.map((box, index) => {
            const Icon = box.icon;
            return (
              <button
                key={box.id}
                onClick={() => handleSelect(index)}
                disabled={isReadOnly || revealed}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-4 transition-all duration-500 ${
                  revealed && selectedBox === index
                    ? 'border-yellow-500 bg-yellow-50 bg-yellow-900/20 scale-105 shadow-xl'
                    : revealed
                    ? 'border-slate-200 border-[var(--border-primary)] bg-slate-50 bg-[var(--bg-tertiary)] opacity-50 scale-95'
                    : 'border-yellow-200 border-[var(--border-primary)] bg-white bg-[var(--bg-tertiary)] hover:border-yellow-400 hover:border-yellow-500 hover:bg-yellow-50 hover:bg-[var(--bg-secondary)] hover:-translate-y-2 shadow-md cursor-pointer'
                }`}
              >
                <Icon className={`w-10 h-10 mb-3 ${revealed && selectedBox === index ? 'text-yellow-500 animate-bounce' : 'text-slate-400 text-[var(--text-muted)]'}`} />
                
                {revealed && selectedBox === index ? (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center ${box.color} text-white rounded-xl p-3 animate-in fade-in zoom-in duration-300`}>
                    <Heart className="w-6 h-6 fill-white mb-1" />
                    <p className="font-bold text-sm text-center leading-tight">{box.title}</p>
                    <p className="text-[10px] mt-1 text-white/80 text-center">{box.desc}</p>
                  </div>
                ) : (
                  <span className="font-bold text-slate-500 text-[var(--text-tertiary)] text-sm">盲盒 {index + 1}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6 text-center">
          {isReadOnly && !revealed && (
            <p className="text-sm font-bold text-slate-500 text-[var(--text-tertiary)]">等待赢家选择盲盒...</p>
          )}
          {revealed && (
            <p className="text-sm font-bold text-yellow-600 text-yellow-400 animate-pulse">奖励已揭晓！即将关闭...</p>
          )}
        </div>
      </div>
    </div>
  );
}