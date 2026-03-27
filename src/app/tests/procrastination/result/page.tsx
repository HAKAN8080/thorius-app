'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Timer, Zap, Shield, Target, ArrowLeft, Loader2, AlertTriangle, CheckCircle, TrendingDown, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FACTORS = [
  { id: 'starting', name: 'Başlama Direnci', color: '#EF4444', icon: Zap },
  { id: 'perfectionism', name: 'Mükemmeliyetçilik', color: '#8B5CF6', icon: Target },
  { id: 'avoidance', name: 'Kaçınma Davranışı', color: '#F59E0B', icon: Shield },
  { id: 'time', name: 'Zaman Yönetimi', color: '#06B6D4', icon: Timer },
];

const LEVELS = {
  severe: { label: 'Yüksek Erteleme', color: '#EF4444', icon: AlertTriangle, desc: 'Erteleme hayatınızı ciddi şekilde etkiliyor' },
  moderate: { label: 'Orta Erteleme', color: '#F59E0B', icon: TrendingDown, desc: 'Erteleme bazı alanlarda sorun yaratıyor' },
  mild: { label: 'Hafif Erteleme', color: '#06B6D4', icon: CheckCircle, desc: 'Erteleme eğiliminiz kontrol altında' },
  low: { label: 'Düşük Erteleme', color: '#10B981', icon: CheckCircle, desc: 'Erteleme sizin için bir sorun değil' },
};

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<{ scores: Record<string, number>; level: string } | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastProcrastinationResult');
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
      const res = await fetch('/api/tests/procrastination-report', {
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

  const handleSendEmail = async () => {
    if (!result || !analysis) return;
    setSendingEmail(true);
    try {
      const levelData = LEVELS[result.level as keyof typeof LEVELS] || LEVELS.moderate;
      const response = await fetch('/api/tests/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'procrastination',
          scores: result.scores,
          dimensions: FACTORS.map(f => ({
            id: f.id,
            name: f.name,
            score: result.scores[f.id] || 0,
            color: f.color,
          })),
          overallScore: result.scores.overall,
          overallLabel: levelData.label,
          analysis: analysis,
        }),
      });
      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (error) {
      console.error('Email gonderme hatasi:', error);
    }
    setSendingEmail(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!result) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p>Sonuç bulunamadı</p><Link href="/tests/procrastination"><Button>Teste Dön</Button></Link></div>;

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
            <p className="text-sm text-muted-foreground mb-2">Erteleme Profiliniz</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: levelData.color }}>{levelData.label}</h1>
            <p className="text-muted-foreground">{levelData.desc}</p>
            <p className="mt-4 text-2xl font-bold">Genel Skor: {result.scores.overall}%</p>
          </div>
        </motion.div>

        {/* Faktör Skorları */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Faktör Analizi</h2>
          <div className="space-y-4">
            {FACTORS.map((f, idx) => {
              const score = result.scores[f.id] || 0;
              const Icon = f.icon;
              return (
                <div key={f.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: f.color }} />
                      </div>
                      <span className="font-medium">{f.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: f.color }}>{score}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: f.color }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.5, delay: idx * 0.1 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {score >= 70 ? 'Bu alanda ciddi zorluk yaşıyorsunuz' : score >= 50 ? 'Gelişim alanı' : score >= 30 ? 'Kontrol altında' : 'Güçlü alan'}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Analizi */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Kişiselleştirilmiş Aksiyon Planı</h2>
          {generating ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Aksiyon planı oluşturuluyor...</div>
          ) : analysis ? (
            <div className="prose prose-sm dark:prose-invert max-w-none"><p className="whitespace-pre-wrap leading-relaxed">{analysis}</p></div>
          ) : <p className="text-muted-foreground">Analiz yüklenemedi</p>}
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSendEmail}
            disabled={sendingEmail || emailSent || !analysis}
          >
            {sendingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : emailSent ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {emailSent ? 'Gonderildi!' : 'Email Gonder'}
          </Button>
          <Link href="/tests" className="flex-1">
            <Button variant="outline" className="w-full">Baska Test Coz</Button>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Erteleme alışkanlıklarınızı yenmek için bir koçla çalışın</p>
          <Link href="/mentors"><Button className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">Koç ile Görüş</Button></Link>
        </div>
      </div>
    </main>
  );
}

export default function ProcrastinationResultPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><ResultContent /></Suspense>;
}
