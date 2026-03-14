import { X, PenTool } from 'lucide-react';
import { useState } from 'react';

interface CustomDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dare: string) => void;
}

export default function CustomDareModal({ isOpen, onClose, onSubmit }: CustomDareModalProps) {
  const [dareText, setDareText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (dareText.trim()) {
      onSubmit(dareText.trim());
      setDareText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden bg-white bg-[var(--bg-elevated)] rounded-xl shadow-2xl border border-primary/10 border-[var(--border-primary)] animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-purple-100 bg-[var(--bg-purple)] text-purple-500">
            <PenTool className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-[var(--text-primary)]">写下大冒险</h2>
          <p className="mt-1 text-sm text-slate-500 text-[var(--text-tertiary)]">发挥你的想象力，给对方一个惊喜（吓）！</p>
        </div>

        <div className="px-6 py-4">
          <textarea
            value={dareText}
            onChange={(e) => setDareText(e.target.value)}
            placeholder="例如：给我发一个52块的红包..."
            className="w-full h-32 p-3 border border-slate-200 border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          />
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={!dareText.trim()}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            放入题库
          </button>
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
