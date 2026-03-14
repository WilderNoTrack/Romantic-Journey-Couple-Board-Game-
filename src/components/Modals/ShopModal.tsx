import { Heart, Database, Dices, Shield, Rocket, Undo, Ticket, PenTool, Lock } from 'lucide-react';
import { useToast } from '../Toast';

const SHOP_ITEMS = [
  { id: 'remoteDice' as const, name: '遥控骰子', desc: '心之所向，指定下次点数', cost: 50, level: 1, icon: Dices, color: 'primary' },
  { id: 'shield' as const, name: '甜心护盾', desc: '温柔守护，免受一次惩罚', cost: 30, level: 1, icon: Shield, color: 'primary' },
  { id: 'booster' as const, name: '爱情助推器', desc: '爱意加速，下次步数翻倍', cost: 40, level: 2, icon: Rocket, color: 'primary' },
  { id: 'customDare' as const, name: '空白大冒险卡', desc: '亲自写下一条大冒险，加入题库中', cost: 50, level: 2, icon: PenTool, color: 'purple' },
  { id: 'wishCoupon' as const, name: '现实心愿券', desc: '让对方在现实中为你完成一个心愿', cost: 100, level: 3, icon: Ticket, color: 'pink' },
];

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  level: number;
  onBuyItem: (item: 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare', cost: number) => void;
  isReadOnly?: boolean;
}

export default function ShopModal({ isOpen, onClose, coins, level, onBuyItem, isReadOnly }: ShopModalProps) {
  const toast = useToast();
  
  if (!isOpen) return null;

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (level < item.level) {
      toast.showToast(`需要达到等级 ${item.level} 才能购买！`, 'error');
      return;
    }
    if (coins < item.cost) {
      toast.showToast('金币不足！', 'error');
      return;
    }
    onBuyItem(item.id, item.cost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-[480px] overflow-hidden rounded-xl bg-background-light bg-[var(--bg-elevated)] shadow-2xl border border-primary/20 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className="relative px-6 pt-8 pb-4 text-center">
          <div className="absolute top-4 right-6 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 bg-primary/20 rounded-full px-3 py-1 border border-primary/20 border-primary/30">
              <Database className="text-primary w-4 h-4" />
              <span className="text-primary font-bold text-sm">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 bg-[var(--bg-yellow)] rounded-full px-3 py-1 border border-yellow-200 border-yellow-700">
              <span className="text-yellow-600 text-yellow-400 font-bold text-sm">Lv.{level}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-[var(--text-primary)] flex items-center justify-center gap-2">
            <Heart className="text-primary w-6 h-6 fill-primary" />
            浪漫补给站
            <Heart className="text-primary w-6 h-6 fill-primary" />
          </h1>
          <p className="mt-2 text-slate-500 text-[var(--text-tertiary)] text-sm">用爱意点缀你的每一步飞行</p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {SHOP_ITEMS.map((item) => {
            const isLocked = level < item.level;
            const Icon = item.icon;
            const bgColor = item.color === 'purple' ? 'bg-purple-50 bg-[var(--bg-purple)]' : item.color === 'pink' ? 'bg-pink-50 bg-[var(--bg-pink)]' : 'bg-primary/5 bg-primary/10';
            
            return (
              <div 
                key={item.id}
                className={`group flex items-center gap-4 p-4 rounded-lg bg-white bg-[var(--bg-tertiary)] border transition-colors ${
                  isLocked ? 'border-slate-200 border-[var(--border-primary)] opacity-60' : 'border-slate-200 border-[var(--border-primary)] hover:border-primary/50'
                }`}
              >
                <div className={`w-16 h-16 flex-shrink-0 rounded-lg ${bgColor} flex items-center justify-center relative overflow-hidden`}>
                  <Icon className={`w-8 h-8 relative z-10 ${item.color === 'purple' ? 'text-purple-500' : item.color === 'pink' ? 'text-pink-500' : 'text-primary'} ${item.id === 'shield' ? 'fill-primary/20' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-[var(--text-primary)]">{item.name}</h3>
                    {item.level > 1 && (
                      <span className="text-[10px] bg-slate-100 bg-[var(--bg-secondary)] text-slate-500 text-[var(--text-tertiary)] px-1.5 py-0.5 rounded">
                        Lv.{item.level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 text-[var(--text-tertiary)]">{item.desc}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {item.cost} <span className="text-[10px] font-normal">金币</span>
                    </span>
                    {!isReadOnly ? (
                      <button 
                        onClick={() => handleBuy(item)}
                        disabled={isLocked}
                        className={`px-4 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                          isLocked 
                            ? 'bg-slate-200 bg-[var(--bg-secondary)] text-slate-400 text-[var(--text-muted)] cursor-not-allowed' 
                            : 'bg-primary text-white hover:bg-primary-hover'
                        }`}
                      >
                        {isLocked ? '未解锁' : '购买'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 text-[var(--text-muted)] font-bold">浏览中...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6">
          {!isReadOnly ? (
            <button
              onClick={onClose}
              className="w-full bg-slate-100 bg-[var(--bg-tertiary)] text-slate-700 text-[var(--text-secondary)] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <Undo className="w-4 h-4" />
              返回游戏
            </button>
          ) : (
            <div className="text-center text-sm font-bold text-slate-500 text-[var(--text-tertiary)] py-3">
              等待对方完成购买...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
