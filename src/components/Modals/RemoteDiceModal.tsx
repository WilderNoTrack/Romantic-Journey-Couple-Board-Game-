import { X, Dices } from 'lucide-react';

interface RemoteDiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: number) => void;
}

export default function RemoteDiceModal({ isOpen, onClose, onSelect }: RemoteDiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 bg-primary/20 text-primary">
            <Dices className="w-6 h-6 fill-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)]">遥控骰子</h2>
          <p className="mt-1 text-sm text-slate-500 text-[var(--text-tertiary)]">请选择您想要的骰子点数</p>
        </div>

        <div className="px-6 py-6 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className="flex items-center justify-center h-16 text-2xl font-bold text-slate-700 text-[var(--text-primary)] bg-slate-50 bg-[var(--bg-tertiary)] border-2 border-slate-200 border-[var(--border-primary)] rounded-xl hover:border-primary hover:border-primary hover:text-primary hover:bg-primary/5 hover:bg-primary/10 transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 text-[var(--text-muted)] hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
