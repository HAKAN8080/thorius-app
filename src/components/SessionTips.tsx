'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Brain, Target, MessageSquare, ClipboardList, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ── Seans İpuçları ─────────────────────────────────────────────────────── */
const SESSION_TIPS = [
  {
    icon: Target,
    title: 'Gündemini Netleştir',
    text: 'Bu seanstan beklentin net mi? Ne elde etmek istediğini başta belirle.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: MessageSquare,
    title: 'Açık ve Net Ol',
    text: 'Açık ve net sorular sorarsan, daha faydalı yanıtlar alırsın.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: ClipboardList,
    title: 'Gündemde Kal',
    text: 'Belirlediğin gündemin dışına çıkmamaya özen göster.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Lightbulb,
    title: 'Derinleştir',
    text: 'Yüzeysel sorular yerine, "Neden?" ve "Nasıl?" sorularıyla derinleş.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Brain,
    title: 'Düşün ve Yansıt',
    text: 'Koçun sorularını hemen yanıtlama, düşün ve içsel yansıma yap.',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
];

/* ── Test Tanımları ─────────────────────────────────────────────────────── */
const ALL_TESTS = [
  { id: 'personality', name: 'Kişilik Envanteri', shortName: 'Kişilik', type: 'big-five', icon: '🧠' },
  { id: 'leadership', name: 'Liderlik Tarzı', shortName: 'Liderlik', type: 'leadership', icon: '👑' },
  { id: 'emotional-intelligence', name: 'Duygusal Zeka', shortName: 'EQ', type: 'eq', icon: '💖' },
  { id: 'life-score', name: 'Yaşam Skoru', shortName: 'Yaşam', type: 'life-score', icon: '⭐' },
  { id: 'procrastination', name: 'Erteleme Profili', shortName: 'Erteleme', type: 'procrastination', icon: '⏰' },
  { id: 'life-purpose', name: 'Yaşam Amacı', shortName: 'Amaç', type: 'life-purpose', icon: '🎯' },
];

interface UserTest {
  testType: string;
}

export function SessionTips() {
  const [tipIndex, setTipIndex] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Kullanıcının tamamladığı testleri al
  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch('/api/tests/history');
        if (res.ok) {
          const data = await res.json();
          const types = (data.tests || []).map((t: UserTest) => t.testType);
          setCompletedTests([...new Set(types)] as string[]);
        }
      } catch {
        // Hata durumunda boş bırak
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  // Yapılmamış testler
  const pendingTests = ALL_TESTS.filter(t => !completedTests.includes(t.type));

  // İpuçları carousel - 6 saniyede bir değiş
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SESSION_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Test carousel - 5 saniyede bir değiş
  useEffect(() => {
    if (pendingTests.length === 0) return;
    const interval = setInterval(() => {
      setTestIndex((prev) => (prev + 1) % pendingTests.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pendingTests.length]);

  const currentTip = SESSION_TIPS[tipIndex];
  const TipIcon = currentTip.icon;

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Başlık */}
      <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
        <Sparkles className="h-4 w-4" />
        Seans Rehberi
      </div>

      {/* İpucu Kartı */}
      <div className={cn(
        'rounded-xl p-4 transition-all duration-500',
        currentTip.bg
      )}>
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', currentTip.color)}>
            <TipIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              {currentTip.title}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {currentTip.text}
            </p>
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {SESSION_TIPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setTipIndex(idx)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                idx === tipIndex ? 'w-4 bg-violet-400' : 'w-1.5 bg-gray-300'
              )}
            />
          ))}
        </div>
      </div>

      {/* Testler Bölümü */}
      {!loading && pendingTests.length > 0 && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
            <ClipboardList className="h-3.5 w-3.5" />
            Önerilen Testler
          </div>

          {/* Test Kartı */}
          <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="text-2xl mb-2">{pendingTests[testIndex].icon}</div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              {pendingTests[testIndex].name}
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Seans sonunda bu testi çözebilirsin
            </p>
            <Link href={`/tests/${pendingTests[testIndex].id}`} target="_blank">
              <button className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-medium py-2 transition-colors">
                Teste Git
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
            {/* Dots */}
            {pendingTests.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {pendingTests.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestIndex(idx)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      idx === testIndex ? 'w-4 bg-violet-400' : 'w-1.5 bg-gray-300'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tüm Testler Linki */}
          <Link
            href="/tests"
            target="_blank"
            className="mt-3 text-center text-xs text-violet-500 hover:text-violet-600 hover:underline"
          >
            Tüm testleri gör ({pendingTests.length} test bekliyor)
          </Link>
        </div>
      )}

      {/* Tüm testler tamamlandıysa */}
      {!loading && pendingTests.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-emerald-50">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm font-medium text-emerald-700">Harika!</p>
          <p className="text-xs text-emerald-600">Tüm testleri tamamladın</p>
        </div>
      )}
    </div>
  );
}
