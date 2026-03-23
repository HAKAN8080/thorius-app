'use client';

import { useState } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function FreeTrialBanner({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isLoggedIn) return null;

  return (
    <div className="relative overflow-hidden px-4 py-3" style={{
      background: 'linear-gradient(135deg, #1a0533 0%, #4c0f8f 25%, #7c3aed 50%, #6d28d9 70%, #0ea5e9 100%)',
    }}>
      {/* Derin parlaklık efekti — ortada lila halo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-20 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/40 blur-2xl" />
      </div>

      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Yıldız parıltıları */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-1 h-0.5 w-0.5 rounded-full bg-white/70 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute left-[40%] bottom-1 h-0.5 w-0.5 rounded-full bg-sky-300/80 animate-ping" style={{ animationDuration: '2.7s', animationDelay: '0.5s' }} />
        <div className="absolute right-[25%] top-1 h-0.5 w-0.5 rounded-full bg-violet-300/80 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '1s' }} />
        <div className="absolute right-[45%] bottom-1 h-px w-px rounded-full bg-white/60 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.3s' }} />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center justify-center gap-3 text-sm font-medium text-white">
          {/* Çift katmanlı yanıp sönen nokta */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-80" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(167,139,250,0.8)]" />
          </span>

          <Sparkles className="hidden h-3.5 w-3.5 shrink-0 text-violet-200 sm:block" />

          <span className="tracking-wide">
            <strong className="text-white drop-shadow-[0_0_8px_rgba(167,139,250,0.9)]">1 Ücretsiz Seans</strong>
            <span className="mx-1.5 text-violet-300">—</span>
            <span className="hidden text-sky-100 sm:inline">Kayıt olun, ödeme yapmadan ilk seansınızı deneyin.</span>
            <span className="text-sky-100 sm:hidden">İlk seansınız ücretsiz.</span>
          </span>

          <Link
            href="/auth/register"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet-400/40 bg-white/15 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:border-white/50 hover:shadow-[0_0_12px_rgba(167,139,250,0.5)]"
          >
            Hemen Başla
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Kapat"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
