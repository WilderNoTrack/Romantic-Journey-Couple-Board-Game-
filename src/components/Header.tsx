import { useState } from 'react';
import { Heart, Settings, HelpCircle, X, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RulesPanel from './RulesPanel';

export default function Header() {
  const { isDark, toggleDark } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const audio = document.querySelector('audio');
    if (audio) {
      audio.muted = !isMuted;
    }
  };

  return (
    <>
      <header 
        className="flex items-center justify-between whitespace-nowrap border-b px-6 py-4 shadow-sm sticky top-0 z-50 bg-[var(--bg-primary)] border-[var(--border-primary)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-[var(--bg-pink)] rounded-lg">
            <Heart className="text-pink-500 w-5 h-5 fill-pink-500" />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            浪漫旅程
          </h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center rounded-xl h-10 w-10 bg-[var(--bg-pink)] text-pink-500 hover:bg-pink-200 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowRules(true)}
            className="flex items-center justify-center rounded-xl h-10 w-10 bg-[var(--bg-pink)] text-pink-500 hover:bg-pink-200 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">设置</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-primary)]">背景音乐</span>
                <button 
                  onClick={toggleMute}
                  className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-[var(--text-tertiary)]" /> : <Volume2 className="w-5 h-5 text-pink-500" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-primary)]">深色模式</span>
                <button 
                  onClick={toggleDark}
                  className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-lg w-full my-8 overflow-hidden">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between sticky top-0 bg-[var(--bg-elevated)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">游戏规则</h2>
              <button onClick={() => setShowRules(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <RulesPanel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
