import { Heart, CircleDollarSign, Play, Flag, Store, HelpCircle, Shuffle } from 'lucide-react';
import ChatPanel from './ChatPanel';

export const BOARD_TILES = [
  { id: 1, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 2, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 3, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 4, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 5, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 6, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 7, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 8, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 9, type: 'fate', bgClass: 'bg-amber-100' },
  { id: 10, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 11, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 12, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 13, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 14, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 15, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 16, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 17, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 18, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 19, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 20, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 21, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 22, type: 'fate', bgClass: 'bg-amber-100' },
  { id: 23, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 24, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 25, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 26, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 27, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 28, type: 'quiz', bgClass: 'bg-purple-100' },
  { id: 29, type: 'coin', bgClass: 'bg-emerald-100' },
  { id: 30, type: 'heart', bgClass: 'bg-pink-100' },
  { id: 31, type: 'shop', bgClass: 'bg-blue-100' },
  { id: 32, type: 'finish', bgClass: 'bg-yellow-100' },
] as const;

export type TileType = typeof BOARD_TILES[number]['type'];

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

interface GameBoardProps {
  himPosition: number;
  herPosition: number;
  turn: 'him' | 'her';
  himJoined: boolean;
  herJoined: boolean;
  himName: string;
  herName: string;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  currentPlayer?: string;
}

export default function GameBoard({ himPosition, herPosition, turn, himJoined, herJoined, himName, herName, messages, onSendMessage, currentPlayer }: GameBoardProps) {
  const himAvatar = '/avatars/him-avatar.jpg';
  const herAvatar = '/avatars/her-avatar.jpg';

  const renderPlayer = (player: 'him' | 'her', position: number, targetPosition: number) => {
    if (player === 'him' && !himJoined) return null;
    if (player === 'her' && !herJoined) return null;
    if (position !== targetPosition) return null;
    return (
      <div
        className={`absolute ${
          player === 'him' ? '-top-3 -right-3' : '-bottom-3 -left-3'
        } h-10 w-10 rounded-full border-2 border-white border-[var(--border-primary)] shadow-md z-20 overflow-hidden bg-white bg-[var(--bg-tertiary)] transition-all duration-500`}
      >
        <img
          alt={player === 'him' ? '他' : '她'}
          src={player === 'him' ? himAvatar : herAvatar}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const getTileStyle = (num: number) => {
    let col = 1;
    let row = 1;
    if (num >= 1 && num <= 9) {
      col = num;
      row = 1;
    } else if (num >= 10 && num <= 16) {
      col = 9;
      row = num - 8;
    } else if (num >= 17 && num <= 25) {
      col = 26 - num;
      row = 9;
    } else if (num >= 26 && num <= 32) {
      col = 1;
      row = 34 - num;
    }
    return { gridColumnStart: col, gridRowStart: row };
  };

  const renderTile = (
    num: number,
    type: TileType,
    bgClass: string
  ) => {
    return (
      <div
        key={num}
        style={getTileStyle(num)}
        className={`w-full h-full min-h-[60px] md:min-h-[80px] ${bgClass} rounded-2xl flex flex-col items-center justify-center border-b-4 border-slate-200 relative transition-transform hover:-translate-y-1 shadow-sm`}
      >
        {num === 1 && (
          <div className="absolute -top-3 -left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-30">
            <Play className="w-3 h-3 fill-white" /> 起点
          </div>
        )}
        {num === 32 && (
          <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-30">
            <Flag className="w-3 h-3 fill-white" /> 终点
          </div>
        )}
        
        <span className="absolute top-1 left-2 text-[10px] font-bold opacity-30">{num}</span>
        
        {type === 'heart' && (
          <>
            <Heart className="text-primary w-5 h-5 md:w-7 md:h-7 fill-primary" />
            <span className="text-[9px] md:text-[10px] font-bold text-primary mt-1">心动</span>
          </>
        )}
        {type === 'coin' && (
          <>
            <CircleDollarSign className="text-emerald-500 w-5 h-5 md:w-7 md:h-7 fill-emerald-500" />
            <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 mt-1">奖励</span>
          </>
        )}
        {type === 'shop' && (
          <>
            <Store className="text-blue-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-blue-600 mt-1">商店</span>
          </>
        )}
        {type === 'quiz' && (
          <>
            <HelpCircle className="text-purple-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-purple-600 mt-1">默契</span>
          </>
        )}
        {type === 'fate' && (
          <>
            <Shuffle className="text-amber-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-amber-600 mt-1">命运</span>
          </>
        )}
        {type === 'finish' && (
          <>
            <Flag className="text-yellow-500 w-5 h-5 md:w-7 md:h-7" />
            <span className="text-[9px] md:text-[10px] font-bold text-yellow-600 mt-1">终点</span>
          </>
        )}
        {renderPlayer('her', herPosition, num)}
        {renderPlayer('him', himPosition, num)}
      </div>
    );
  };

  return (
    <section className="flex-1 order-1 lg:order-2">
      <div className="bg-[var(--bg-elevated)] rounded-3xl shadow-xl p-6 md:p-12 relative overflow-hidden min-h-[600px] flex items-center justify-center border border-primary/10 border-[var(--border-primary)]">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ee2b4b 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        {/* Square Track Board */}
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-9 grid-rows-9 gap-1 md:gap-2 w-full aspect-square">
            {BOARD_TILES.map(tile => renderTile(tile.id, tile.type, tile.bgClass))}
            
            <div className="col-start-2 col-span-7 row-start-2 row-span-7 flex items-center justify-center bg-slate-50/50 bg-[var(--bg-tertiary)]/50 rounded-3xl border-2 border-dashed border-primary/20 border-[var(--border-primary)] p-4 md:p-6 shadow-inner">
              {messages && onSendMessage && currentPlayer && (
                <div className="w-full">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={onSendMessage}
                    currentPlayer={currentPlayer}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
