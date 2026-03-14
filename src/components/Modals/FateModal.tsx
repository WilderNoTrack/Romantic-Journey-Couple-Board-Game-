import { X, Shuffle, ArrowRight, ArrowLeft, RotateCcw, Shield, Store, Repeat, ArrowDown, Gift, Snowflake } from 'lucide-react';

interface FateModalProps {
  isOpen: boolean;
  onClose: () => void;
  fate: string;
  isReadOnly?: boolean;
}

export default function FateModal({ isOpen, onClose, fate, isReadOnly }: FateModalProps) {
  if (!isOpen) return null;

  const getFateDetails = () => {
    switch (fate) {
      case 'swap':
        return { title: '乾坤大挪移', desc: '你们的位置互换了！', color: 'bg-indigo-500', icon: <Shuffle className="w-8 h-8 text-white" /> };
      case 'steal':
        return { title: '散财童子', desc: '你偷走了对方一半的金币！', color: 'bg-amber-500', icon: <Shuffle className="w-8 h-8 text-white" /> };
      case 'bonus':
        return { title: '天降甘霖', desc: '你获得了 50 金币！', color: 'bg-emerald-500', icon: <Shuffle className="w-8 h-8 text-white" /> };
      case 'forward':
        return { title: '顺风顺水', desc: '前进 3 步！', color: 'bg-blue-500', icon: <ArrowRight className="w-8 h-8 text-white" /> };
      case 'backward':
        return { title: '逆水行舟', desc: '后退 2 步！', color: 'bg-red-500', icon: <ArrowLeft className="w-8 h-8 text-white" /> };
      case 'wheel':
        return { title: '命运轮盘', desc: '命运再转一次！随机触发另一个命运', color: 'bg-violet-500', icon: <RotateCcw className="w-8 h-8 text-white" /> };
      case 'shieldbuy':
        return { title: '破财消灾', desc: '损失20金币，获得护盾效果！', color: 'bg-slate-500', icon: <Shield className="w-8 h-8 text-white" /> };
      case 'dash':
        return { title: '秒速前进', desc: '瞬间前进到下一个商店格！', color: 'bg-teal-500', icon: <Store className="w-8 h-8 text-white" /> };
      case 'itemswap':
        return { title: '物品互换', desc: '双方道具栏随机互换一个道具！', color: 'bg-orange-500', icon: <Repeat className="w-8 h-8 text-white" /> };
      case 'leveldown':
        return { title: '等级压制', desc: '对方等级-1（最低1级）', color: 'bg-gray-700', icon: <ArrowDown className="w-8 h-8 text-white" /> };
      case 'gift':
        return { title: '意外惊喜', desc: '获得一个随机道具！', color: 'bg-lime-500', icon: <Gift className="w-8 h-8 text-white" /> };
      case 'freeze':
        return { title: '禁足令', desc: '对方下回合不能移动！', color: 'bg-cyan-700', icon: <Snowflake className="w-8 h-8 text-white" /> };
      default:
        return { title: '命运之轮', desc: '什么都没发生...', color: 'bg-slate-500', icon: <Shuffle className="w-8 h-8 text-white" /> };
    }
  };

  const details = getFateDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className={`h-32 ${details.color} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-xl">
            {details.icon}
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
            🎲 命运 🎲
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)] mb-2">{details.title}</h2>
          <p className="text-lg font-medium text-slate-600 text-[var(--text-tertiary)]">{details.desc}</p>
        </div>

        <div className="px-6 pb-6">
          {!isReadOnly ? (
            <button
              onClick={onClose}
              className={`w-full ${details.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg`}
            >
              接受命运
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