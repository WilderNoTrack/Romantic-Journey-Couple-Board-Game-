import { CheckCircle, Clock, Zap, Shield, Wand2, CircleDollarSign, Copy, Check, Ticket, PenTool } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  inventory: { remoteDice: number; shield: number; booster: number; wishCoupon: number; customDare: number };
  onUseItem: (item: 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare') => void;
  turn: 'him' | 'her';
  himName: string;
  herName: string;
  himCoins: number;
  herCoins: number;
  himExp: number;
  herExp: number;
  himLevel: number;
  herLevel: number;
  himShield: boolean;
  herShield: boolean;
  himBooster: boolean;
  herBooster: boolean;
  isMyTurn: boolean;
  roomId: string;
  himJoined: boolean;
  herJoined: boolean;
  logs: { id: string, timestamp: number, message: string }[];
}

export default function Sidebar({ 
  inventory, 
  onUseItem,
  turn,
  himName,
  herName,
  himCoins,
  herCoins,
  himExp,
  herExp,
  himLevel,
  herLevel,
  himShield,
  herShield,
  himBooster,
  herBooster,
  isMyTurn,
  roomId,
  himJoined,
  herJoined,
  logs
}: SidebarProps) {
  const [copied, setCopied] = useState(false);

  const totalItems = inventory.remoteDice + inventory.shield + inventory.booster + inventory.wishCoupon + inventory.customDare;

  const handleCopyRoomId = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
      {/* Player One (Him) */}
      <div className={`bg-[var(--bg-elevated)] p-4 rounded-xl shadow-sm border ${turn === 'him' && himJoined ? 'border-primary shadow-primary/20' : 'border-[var(--border-accent)]'} flex items-center gap-4 transition-all ${!himJoined ? 'opacity-50' : ''}`}>
        <div className="relative">
          <div className={`h-16 w-16 rounded-full bg-[var(--bg-tertiary)] overflow-hidden border-2 ${turn === 'him' && himJoined ? 'border-primary' : 'border-transparent'}`}>
            {himJoined ? (
              <img
                alt="他"
                className="h-full w-full object-cover"
                src="/avatars/him-avatar.jpg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-xs">等待</div>
            )}
          </div>
          {himJoined && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              LVL {himLevel}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <p className="font-bold text-lg text-[var(--text-primary)]">{himName || '他'} {himJoined ? '' : '(未加入)'}</p>
          {himJoined && (
            <>
              <div className="flex items-center gap-1 text-xs text-yellow-600 font-bold mt-0.5">
                <CircleDollarSign className="w-3.5 h-3.5" /> {himCoins}
              </div>
              <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${himExp}%` }} />
              </div>
            </>
          )}
        </div>
        <div className="ml-auto flex gap-1.5">
          {himShield && (
            <div className="bg-[var(--bg-blue)] p-1.5 rounded-lg border border-blue-100" title="甜心护盾生效中">
              <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
            </div>
          )}
          {himBooster && (
            <div className="bg-[var(--bg-green)] p-1.5 rounded-lg border border-green-100" title="爱情助推器生效中">
              <Wand2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Player Two (Her) */}
      <div className={`bg-[var(--bg-elevated)] p-4 rounded-xl shadow-sm border ${turn === 'her' && herJoined ? 'border-primary shadow-primary/20' : 'border-[var(--border-accent)]'} flex items-center gap-4 transition-all ${!herJoined ? 'opacity-50' : ''}`}>
        <div className="relative">
          <div className={`h-16 w-16 rounded-full bg-[var(--bg-tertiary)] overflow-hidden border-2 ${turn === 'her' && herJoined ? 'border-primary' : 'border-transparent'}`}>
            {herJoined ? (
              <img
                alt="她"
                className="h-full w-full object-cover"
                src="/avatars/her-avatar.jpg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-xs">等待</div>
            )}
          </div>
          {herJoined && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              LVL {herLevel}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <p className="font-bold text-lg text-[var(--text-primary)]">{herName || '她'} {herJoined ? '' : '(未加入)'}</p>
          {herJoined && (
            <>
              <div className="flex items-center gap-1 text-xs text-yellow-600 font-bold mt-0.5">
                <CircleDollarSign className="w-3.5 h-3.5" /> {herCoins}
              </div>
              <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-pink-400 h-full rounded-full transition-all" style={{ width: `${herExp}%` }} />
              </div>
            </>
          )}
        </div>
        <div className="ml-auto flex gap-1.5">
          {herShield && (
            <div className="bg-[var(--bg-blue)] p-1.5 rounded-lg border border-blue-100" title="甜心护盾生效中">
              <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
            </div>
          )}
          {herBooster && (
            <div className="bg-[var(--bg-green)] p-1.5 rounded-lg border border-green-100" title="爱情助推器生效中">
              <Wand2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Room ID */}
      <div className="bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-between">
        <span>房间号：<span className="text-[var(--text-primary)] font-mono text-sm ml-1">{roomId}</span></span>
        <button 
          onClick={handleCopyRoomId}
          className="hover:bg-[var(--bg-secondary)] p-1 rounded transition-colors"
          title="复制房间号"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Game Feed */}
      <div className="bg-[var(--bg-elevated)] rounded-xl shadow-sm border border-[var(--border-accent)] overflow-hidden flex flex-col flex-1 min-h-[250px] max-h-[400px]">
        <div className="px-4 py-3 border-b border-[var(--border-accent)] bg-primary/5">
          <h3 className="font-bold text-sm text-primary uppercase tracking-widest">
            最近动态
          </h3>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {logs && logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <p className="text-sm text-[var(--text-secondary)]">{log.message}</p>
                  <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex gap-3 items-start opacity-60">
              <Clock className="text-[var(--text-tertiary)] w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm text-[var(--text-tertiary)]">游戏刚刚开始...</p>
            </div>
          )}
        </div>
      </div>

      {/* My Props */}
      <div className="bg-[var(--bg-elevated)] rounded-xl shadow-sm border border-[var(--border-accent)] p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-[var(--text-tertiary)] uppercase tracking-widest">我的道具</h3>
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {totalItems} 个
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {inventory.remoteDice > 0 && (
            <div 
              onClick={() => onUseItem('remoteDice')}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)] relative group cursor-pointer hover:border-primary/30 transition-colors"
            >
              <Zap className="text-primary w-6 h-6 fill-primary" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 rounded-full">
                x{inventory.remoteDice}
              </span>
            </div>
          )}
          {inventory.shield > 0 && (
            <div 
              onClick={() => onUseItem('shield')}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)] relative group cursor-pointer hover:border-blue-300 transition-colors"
            >
              <Shield className="text-blue-500 w-6 h-6 fill-blue-500" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 rounded-full">
                x{inventory.shield}
              </span>
            </div>
          )}
          {inventory.booster > 0 && (
            <div 
              onClick={() => onUseItem('booster')}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)] relative group cursor-pointer hover:border-green-300 transition-colors"
              title="爱情助推器"
            >
              <Wand2 className="text-green-500 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 rounded-full">
                x{inventory.booster}
              </span>
            </div>
          )}
          {inventory.wishCoupon > 0 && (
            <div 
              onClick={() => onUseItem('wishCoupon')}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)] relative group cursor-pointer hover:border-pink-300 transition-colors"
              title="现实心愿券"
            >
              <Ticket className="text-pink-500 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 rounded-full">
                x{inventory.wishCoupon}
              </span>
            </div>
          )}
          {inventory.customDare > 0 && (
            <div 
              onClick={() => onUseItem('customDare')}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)] relative group cursor-pointer hover:border-purple-300 transition-colors"
              title="空白大冒险卡"
            >
              <PenTool className="text-purple-500 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 rounded-full">
                x{inventory.customDare}
              </span>
            </div>
          )}
          {totalItems === 0 && (
            <div className="text-sm text-[var(--text-tertiary)] italic">
              暂无道具，请前往商店购买
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
