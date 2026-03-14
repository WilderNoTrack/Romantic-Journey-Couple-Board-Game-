import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MUSIC_FILES = [
  '/music/Joey Diggs Jr - My Bed.mp3',
  '/music/The New Romantic - Special Lover.mp3',
];

export default function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('musicEnabled');
    if (saved === 'true') {
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MUSIC_FILES[currentIndex]);
      audioRef.current.volume = 0.3;
      audioRef.current.loop = false;
      
      audioRef.current.addEventListener('ended', () => {
        setCurrentIndex(prev => (prev + 1) % MUSIC_FILES.length);
      });
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      localStorage.setItem('musicEnabled', 'true');
    } else {
      audioRef.current.pause();
      localStorage.setItem('musicEnabled', 'false');
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = MUSIC_FILES[currentIndex];
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleMusic}
      className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] backdrop-blur rounded-lg border border-[var(--border-primary)] hover:border-primary/30 transition-all"
      title={isPlaying ? '关闭音乐' : '开启音乐'}
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 text-primary" />
      ) : (
        <VolumeX className="w-4 h-4 text-[var(--text-tertiary)]" />
      )}
      <span className="text-sm text-[var(--text-secondary)]">{isPlaying ? '音乐' : '静音'}</span>
    </button>
  );
}
