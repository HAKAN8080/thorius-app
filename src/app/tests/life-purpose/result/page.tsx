'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Flame, Heart, ArrowLeft, Loader2, Star, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DIMENSIONS = [
  { id: 'meaning', name: 'Anlam Duygusu', color: '#8B5CF6', icon: Sparkles },
  { id: 'direction', name: 'Hayat Yönü', color: '#06B6D4', icon: Compass },
  { id: 'motivation', name: 'İçsel Motivasyon', color: '#F59E0B', icon: Flame },
  { id: 'connection', name: 'Bağlantı & Katkı', color: '#10B981', icon: Heart },
];

const LEVELS = {
  high: { label: 'Güçlü Yaşam Amacı', color: '#10B981', icon: Star, desc: 'Hayatınızda güçlü bir anlam ve yön duygusu var' },
  moderate: { label: 'Gelişen Amaç', color: '#06B6D4', icon: Target, desc: 'Yaşam amacınız şekilleniyor, netleştirmeye devam edin' },
  searching: { label: 'Arayış İçinde', color: '#F59E0B', icon: Compass, desc: 'Anlamı ve yönü keşfetme sürecindesiniz' },
  low: { label: 'Yön Arayışı', color: '#8B5CF6', icon: Lightbulb, desc: 'Yaşam amacınızı keşfetme zamanı gelmiş olabilir' },
};

function ResultContent() {
  const router = useRouter();
  const [result, setResult] = useState<{ scores: Record<string, number>; level: string } | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastLifePurposeResult');
    if (stored) {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      setLoading(false);
      generateAnalysis(parsed);
    } else {
      setLoading(false);
    }
  }, []);

  const generateAnalysis = async (data: { scores: Record<string, number>; level: string }) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/tests/life-purpose-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { analysis } = await res.json();
        setAnalysis(analysis);
      }
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!result) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p>Sonuç bulunamadı</p><Link href="/tests/life-purpose"><Button>Teste Dön</Button></Link></div>;

  const levelData = LEVELS[result.level as keyof typeof LEVELS] || LEVELS.moderate;
  const LevelIcon = levelData.icon;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => router.push('/tests')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Testlere Dön
        </Button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border overflow-hidden mb-8" style={{ background: `linear-gradient(135deg, ${levelData.color}15, ${levelData.color}05)` }}>
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${levelData.color}20` }}>
              <LevelIcon className="h-10 w-10" style={{ color: levelData.color }} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Yaşam Amacı Profiliniz</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: levelData.color }}>{levelData.label}</h1>
            <p className="text-muted-foreground">{levelData.desc}</p>
            <p className="mt-4 text-2xl font-bold">Genel Skor: {result.scores.overall}%</p>
          </div>
        </motion.div>

        {/* Boyut Skorları */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Boyut Analizi</h2>
          <div className="space-y-4">
            {DIMENSIONS.map((d, idx) => {
              const score = result.scores[d.id] || 0;
              const Icon = d.icon;
              return (
                <div key={d.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${d.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: d.color }} />
                      </div>
                      <span className="font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: d.color }}>{score}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: d.color }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.5, delay: idx * 0.1 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {score >= 75 ? 'Güçlü alan' : score >= 50 ? 'Gelişim potansiyeli' : score >= 25 ? 'Keşfedilmeyi bekliyor' : 'Odaklanılması gereken alan'}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Analizi */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Kişiselleştirilmiş Yön Haritası</h2>
          {generating ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Yön haritanız oluşturuluyor...</div>
          ) : analysis ? (
            <div className="prose prose-sm dark:prose-invert max-w-none"><p className="whitespace-pre-wrap leading-relaxed">{analysis}</p></div>
          ) : <p className="text-muted-foreground">Analiz yüklenemedi</p>}
        </motion.div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Yaşam amacınızı netleştirmek için bir koçla çalışın</p>
          <Link href="/mentors"><Button className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500">Koç ile Görüş</Button></Link>
        </div>
      </div>
    </main>
  );
}

export default function LifePurposeResultPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><ResultContent /></Suspense>;
}
