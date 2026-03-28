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

// Her çubuğun bağımsız frekans, faz ve yükseklik parametreleri
// Ortadaki çubuklar doğal olarak daha yüksek (gerçek ses spektrumu)
const BARS = [
  { freq: 2.1, phase: 0.0,  base: 12, amp: 18 },
  { freq: 3.4, phase: 1.2,  base: 16, amp: 28 },
  { freq: 2.7, phase: 0.5,  base: 20, amp: 38 },
  { freq: 4.1, phase: 2.1,  base: 22, amp: 44 },
  { freq: 3.2, phase: 1.7,  base: 26, amp: 52 },
  { freq: 2.8, phase: 0.8,  base: 28, amp: 58 }, // merkez — en yüksek
  { freq: 3.9, phase: 3.0,  base: 26, amp: 52 },
  { freq: 2.3, phase: 1.1,  base: 22, amp: 44 },
  { freq: 4.0, phase: 0.3,  base: 20, amp: 38 },
  { freq: 3.1, phase: 1.9,  base: 16, amp: 28 },
  { freq: 2.5, phase: 0.7,  base: 12, amp: 18 },
];

const IDLE_BARS = BARS.map(b => ({ ...b, amp: 3, base: 6 })); // nefes alıyor gibi

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
      'overflow-hidden transition-all duration-500 ease-in-out',
      isPlaying ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
    )}>
      <div className="mx-auto max-w-xs px-4 pt-5 pb-3">
        <div className="flex flex-col items-center gap-3">

          {/* Avatar + halka efekti */}
          <div className="relative flex items-center justify-center">
            {/* En dış soluk halka */}
            <div className={cn(
              'absolute rounded-full transition-all duration-700',
              isPlaying
                ? 'w-28 h-28 bg-violet-400/10 animate-pulse'
                : 'w-24 h-24 bg-transparent'
            )} />
            {/* Orta parlak halka */}
            <div className={cn(
              'absolute rounded-full border-2 transition-all duration-500',
              isPlaying
                ? 'w-24 h-24 border-violet-400/50 shadow-[0_0_20px_4px_rgba(139,92,246,0.3)]'
                : 'w-22 h-22 border-violet-200/30'
            )} />
            {/* Avatar */}
            <div className="relative z-10 h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-xl">
              {isImageUrl(mentor.avatar) ? (
                <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-3xl">
                  {mentor.avatar}
                </div>
              )}
            </div>
          </div>

          {/* Ses dalgası — smooth, bağımsız çubuklar */}
          <div className="flex items-end justify-center gap-[3px]" style={{ height: '52px' }}>
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-violet-600 to-purple-400 transition-none"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>

          {/* Karaoke kelime gösterimi */}
          <div className="h-5 flex items-center gap-2 text-sm font-medium overflow-hidden">
            {currentWord && (
              <span className="text-violet-700 animate-fade-in">{currentWord}</span>
            )}
            {nextWord && (
              <span className="text-violet-300 text-xs">{nextWord}</span>
            )}
            {!currentWord && isPlaying && (
              <span className="text-violet-300 text-xs tracking-widest animate-pulse">···</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
