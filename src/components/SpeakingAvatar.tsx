'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { Mentor } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

interface SpeakingAvatarProps {
  mentor: Mentor;
  isPlaying: boolean;
  audioTime: number;
  wordTimings: WordTiming[];
}

function isImageUrl(url: string) {
  return url.startsWith('http') || url.startsWith('/');
}

// Minimal ses çubukları - sadece 3 çubuk
const BARS = [
  { freq: 2.5, phase: 0.0,  base: 8, amp: 16 },
  { freq: 3.2, phase: 1.2,  base: 12, amp: 22 }, // merkez
  { freq: 2.8, phase: 0.6,  base: 8, amp: 16 },
];

const IDLE_BARS = BARS.map(b => ({ ...b, amp: 2, base: 4 }));

export function SpeakingAvatar({ mentor, isPlaying, audioTime, wordTimings }: SpeakingAvatarProps) {
  const [barHeights, setBarHeights] = useState<number[]>(BARS.map(b => b.base));
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Animasyon döngüsü
  useEffect(() => {
    const bars = isPlaying ? BARS : IDLE_BARS;

    const animate = (now: number) => {
      if (startTimeRef.current === 0) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000;

      const heights = bars.map(({ freq, phase, base, amp }) =>
        Math.round(base + amp * Math.abs(Math.sin(elapsed * freq + phase)))
      );
      setBarHeights(heights);
      animRef.current = requestAnimationFrame(animate);
    };

    startTimeRef.current = 0;
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  // Şu an konuşulan kelime
  const currentWord = useMemo(() => {
    if (!isPlaying || !wordTimings.length) return null;
    return wordTimings.find(w => audioTime >= w.start && audioTime <= w.end + 0.12)?.word ?? null;
  }, [isPlaying, audioTime, wordTimings]);

  const nextWord = useMemo(() => {
    if (!isPlaying || !wordTimings.length) return null;
    const idx = wordTimings.findIndex(w => audioTime >= w.start && audioTime <= w.end + 0.12);
    return idx >= 0 && idx + 1 < wordTimings.length ? wordTimings[idx + 1].word : null;
  }, [isPlaying, audioTime, wordTimings]);

  return (
    <div className={cn(
      'overflow-hidden transition-all duration-300 ease-in-out',
      isPlaying ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
    )}>
      <div className="mx-auto flex items-center justify-center gap-3 py-2">
        {/* Minimal avatar */}
        <div className="h-8 w-8 rounded-full overflow-hidden border border-violet-200 shadow-sm">
          {isImageUrl(mentor.avatar) ? (
            <Image src={mentor.avatar} alt={mentor.name} width={32} height={32} className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-sm">
              {mentor.avatar}
            </div>
          )}
        </div>

        {/* Minimal ses çubukları */}
        <div className="flex items-center gap-[2px]" style={{ height: '24px' }}>
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="w-[2px] rounded-full bg-violet-500/70 transition-none"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        {/* Tek kelime gösterimi */}
        {currentWord && (
          <span className="text-xs text-violet-600 font-medium min-w-[60px]">{currentWord}</span>
        )}
      </div>
    </div>
  );
}
