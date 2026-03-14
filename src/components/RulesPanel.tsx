import { useState } from 'react';
import { ChevronDown, ChevronUp, Heart, Coins, Store, HelpCircle, Shuffle, Star, Zap, Shield, Rocket, Ticket, PenTool } from 'lucide-react';

export default function RulesPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const tileTypes = [
    { icon: Heart, name: '心动格', desc: '真心话/大冒险挑战', color: 'text-pink-500', bg: 'bg-[var(--bg-pink)]' },
    { icon: Coins, name: '奖励格', desc: '获得 50 金币', color: 'text-emerald-500', bg: 'bg-[var(--bg-green)]' },
    { icon: Store, name: '商店格', desc: '购买各种道具', color: 'text-blue-500', bg: 'bg-[var(--bg-blue)]' },
    { icon: HelpCircle, name: '默契格', desc: '回答问题赚金币', color: 'text-purple-500', bg: 'bg-[var(--bg-purple)]' },
    { icon: Shuffle, name: '命运格', desc: '随机事件发生', color: 'text-amber-500', bg: 'bg-[var(--bg-amber)]' },
    { icon: Star, name: '终点格', desc: '选择盲盒大奖', color: 'text-yellow-500', bg: 'bg-[var(--bg-yellow)]' },
  ];

  const items = [
    { icon: Zap, name: '遥控骰子', desc: '指定下次点数', cost: 50 },
    { icon: Shield, name: '甜心护盾', desc: '免受一次惩罚', cost: 30 },
    { icon: Rocket, name: '爱情助推器', desc: '步数翻倍', cost: 40 },
    { icon: Ticket, name: '现实心愿券', desc: '让对方实现心愿', cost: 100 },
    { icon: PenTool, name: '空白大冒险卡', desc: '自定义大冒险', cost: 50 },
  ];

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] backdrop-blur rounded-xl border border-[var(--border-primary)] hover:border-pink-300 transition-all"
      >
        <span className="flex items-center gap-2 font-medium text-[var(--text-secondary)]">
          📖 查看游戏规则
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[var(--bg-primary)] backdrop-blur rounded-xl border border-[var(--border-primary)] p-6 space-y-6">
          {/* 游戏目标 */}
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 flex items-center gap-2">
              🎯 游戏目标
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              双人轮流掷骰子前进，踩到不同格子触发各种有趣事件。经过终点可获得金币和经验，
              两位玩家都走完一圈后棋盘升级，题目会更加刺激！最终到达终点选择盲盒大奖！
            </p>
          </div>

          {/* 格子类型 */}
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
              📍 格子类型
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tileTypes.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.name}
                    className={`flex items-center gap-3 p-3 ${tile.bg} rounded-lg`}
                  >
                    <Icon className={`w-5 h-5 ${tile.color}`} />
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{tile.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{tile.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 道具说明 */}
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
              🎁 道具说明
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-pink-500" />
                      <span className="font-medium text-[var(--text-secondary)] text-sm">{item.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{item.desc}</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-600">{item.cost}💰</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              * 部分道具需要达到一定等级才能购买
            </p>
          </div>

          {/* 等级系统 */}
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 flex items-center gap-2">
              ⭐ 等级系统
            </h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>• <strong className="text-[var(--text-primary)]">玩家等级</strong>：完成挑战、经过终点获得经验升级</p>
              <p>• <strong className="text-[var(--text-primary)]">棋盘等级</strong>：双方各走完一圈后棋盘升级（最高 3 级）</p>
              <p>• <strong className="text-[var(--text-primary)]">等级效果</strong>：棋盘等级越高，真心话/大冒险题目越刺激！</p>
            </div>
          </div>

          {/* 特殊事件 */}
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 flex items-center gap-2">
              ✨ 特殊事件
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              掷骰子时有 10% 概率触发特殊事件：流星许愿、心心相印、爱神祝福、幸运彩虹等惊喜！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
