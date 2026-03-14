import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const THEMES = [
  { id: 'pink', name: '粉色', color: 'bg-pink-500' },
  { id: 'blue', name: '蓝色', color: 'bg-blue-500' },
  { id: 'purple', name: '紫色', color: 'bg-purple-500' },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur rounded-lg border border-slate-200">
      <Palette className="w-4 h-4 text-slate-400" />
      <div className="flex gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`w-5 h-5 rounded-full ${t.color} transition-all ${
              theme === t.id ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'
            }`}
            title={t.name}
          />
        ))}
      </div>
    </div>
  );
}