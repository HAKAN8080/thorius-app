'use client';

import { useMemo } from 'react';
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

const BAR_DELAYS = [0, 0.15, 0.07, 0.22, 0.11, 0.18, 0.04];
const BAR_HEIGHTS = ['40%', '70%', '100%', '60%', '90%', '50%', '75%'];

export function SpeakingAvatar({ mentor, isPlaying, audioTime, wordTimings }: SpeakingAvatarProps) {
  // Şu an konuşulan kelimeyi bul
  const currentWord = useMemo(() => {
    if (!isPlaying || !wordTimings.length) return null;
    return wordTimings.find(w => audioTime >= w.start && audioTime <= w.end + 0.12)?.word ?? null;
  }, [isPlaying, audioTime, wordTimings]);

  // Sonraki kelimeyi bul (soluk gösterim için)
  const nextWord = useMemo(() => {
    if (!isPlaying || !wordTimings.length) return null;
    const idx = wordTimings.findIndex(w => audioTime >= w.start && audioTime <= w.end + 0.12);
    return idx >= 0 && idx + 1 < wordTimings.length ? wordTimings[idx + 1].word : null;
  }, [isPlaying, audioTime, wordTimings]);

  return (
    <div className={cn(
      'overflow-hidden transition-all duration-500 ease-in-out',
      isPlaying ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
    )}>
      <div className="mx-auto max-w-xs px-4 pt-5 pb-4">
        <div className="flex flex-col items-center gap-3">

          {/* Avatar */}
          <div className="relative">
            {/* Dış pulse halkası */}
            <div className={cn(
              'absolute inset-0 rounded-full transition-all duration-300',
              isPlaying && 'animate-ping opacity-20 bg-violet-500 scale-110'
            )} />
            {/* İç parlama halkası */}
            <div className={cn(
              'absolute -inset-1.5 rounded-full border-2 transition-all duration-300',
              isPlaying
                ? 'border-violet-400 shadow-[0_0_16px_4px_rgba(139,92,246,0.35)]'
                : 'border-violet-200'
            )} />
            {/* Avatar görsel */}
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
              {isImageUrl(mentor.avatar) ? (
                <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-3xl">
                  {mentor.avatar}
                </div>
              )}
            </div>
          </div>

          {/* Ses dalgası çubukları */}
          <div className="flex items-center gap-[3px] h-8">
            {BAR_DELAYS.map((delay, i) => (
              <div
                key={i}
                className={cn(
                  'w-[3px] rounded-full bg-violet-500 transition-all',
                  isPlaying ? 'animate-bounce' : 'h-[3px] opacity-30'
                )}
                style={isPlaying ? {
                  animationDelay: `${delay}s`,
                  animationDuration: '0.6s',
                  height: BAR_HEIGHTS[i],
                } : undefined}
              />
            ))}
          </div>

          {/* Konuşulan kelime (karaoke efekti) */}
          <div className="h-6 flex items-center gap-1.5 text-sm font-medium">
            {currentWord && (
              <span className="text-violet-700 transition-all duration-100 animate-fade-in">
                {currentWord}
              </span>
            )}
            {nextWord && (
              <span className="text-violet-300 text-xs transition-all duration-200">
                {nextWord}
              </span>
            )}
            {!currentWord && isPlaying && (
              <span className="text-violet-400 text-xs animate-pulse">···</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
