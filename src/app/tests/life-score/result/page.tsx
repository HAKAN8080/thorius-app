'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star, Download, ArrowLeft, Sparkles, Loader2,
  TrendingUp, Target, Users, Briefcase, Activity,
  Wallet, Scale, Heart, RefreshCw, Award, Zap, CheckCircle,
  Mail, Check
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

// Kategoriler
const CATEGORIES = [
  { id: 'happiness', name: 'Mutluluk', fullName: 'Mutluluk & Pozitif Duygular', color: '#F59E0B', icon: Sparkles },
  { id: 'meaning', name: 'Anlam', fullName: 'Anlam & Amac', color: '#8B5CF6', icon: Target },
  { id: 'achievement', name: 'Basari', fullName: 'Basari & Kariyer', color: '#10B981', icon: Briefcase },
  { id: 'relationships', name: 'Iliskiler', fullName: 'Iliskiler & Sosyal Bag', color: '#EC4899', icon: Users },
  { id: 'health', name: 'Saglik', fullName: 'Saglik & Enerji', color: '#EF4444', icon: Activity },
  { id: 'finance', name: 'Finans', fullName: 'Finansal Guvenlik', color: '#06B6D4', icon: Wallet },
  { id: 'growth', name: 'Gelisim', fullName: 'Kisisel Gelisim', color: '#14B8A6', icon: TrendingUp },
  { id: 'balance', name: 'Denge', fullName: 'Yasam Dengesi', color: '#6366F1', icon: Scale },
];

// AI Rapor tipi
interface AIReport {
  summary: string;
  lifeLevel: string;
  topStrengths: string[];
  priorityAreas: string[];
  quickWins: string[];
  longTermGoals: string[];
  weeklyPlan: { day: string; focus: string; action: string }[];
}

// Hayat Skoru seviye yorumu
const getLifeLevel = (score: number) => {
  if (score >= 85) return { level: 'Olağanüstü', emoji: '🌟', color: '#10B981', description: 'Hayatiniz harika bir dengede! Bu seviyeyi korumak icin calisin.' };
  if (score >= 70) return { level: 'Cok Iyi', emoji: '✨', color: '#06B6D4', description: 'Guclu bir temele sahipsiniz. Bazi alanlari gelistirerek zirveye ulasabilirsiniz.' };
  if (score >= 55) return { level: 'Iyi', emoji: '👍', color: '#F59E0B', description: 'Dogru yoldasiniz. Odaklanacak alanlari belirleyip ilerlemeye devam edin.' };
  if (score >= 40) return { level: 'Gelisim Asamasinda', emoji: '🌱', color: '#F97316', description: 'Potansiyeliniz yuksek. Kucuk adimlarla buyuk degisimler yaratabilirsiniz.' };
  return { level: 'Baslangic', emoji: '🚀', color: '#EF4444', description: 'Yolculugunuz yeni basliyor. Her kucuk adim sizi ileriye tasir.' };
};

// Skor yorumu
const getScoreInterpretation = (category: string, score: number) => {
  const interpretations: Record<string, { low: string; medium: string; high: string }> = {
    happiness: {
      low: 'Gunluk yasaminizda daha fazla keyif ve nese kaynaklari bulmaya odaklanabilirsiniz.',
      medium: 'Mutluluk seviyeniz dengeli. Kucuk seylere sukretme pratigiyle daha da artirabilirsiniz.',
      high: 'Pozitif duygular konusunda cok guclusunuz. Bu enerjiyi cevrenize yaymaya devam edin.',
    },
    meaning: {
      low: 'Hayatiniza anlam katan aktiviteler ve degerlerinizi kesfetmeye zaman ayirin.',
      medium: 'Anlam duygunuz var. Daha buyuk bir amaca baglanti kurarak derinlestirebilirsiniz.',
      high: 'Yasaminiz anlam ve amac dolu. Bu netlik sizi guclendiriyor.',
    },
    achievement: {
      low: 'Kucuk hedefler belirleyip basari deneyimi yasayarak motivasyonunuzu artirabilirsiniz.',
      medium: 'Kariyer yolculugunuzda ilerliyorsunuz. Net hedeflerle hizlanabilirsiniz.',
      high: 'Basari odakli ve uretkensiniz. Basarilarinizi kutlamayi unutmayin.',
    },
    relationships: {
      low: 'Sosyal baglarinizi guclendirmek icin kaliteli zaman yatirimi yapin.',
      medium: 'Iliskileriniz saglikli. Daha derin baglar kurarak zenginlestirebilirsiniz.',
      high: 'Guclu bir sosyal destek aginiz var. Bu degerli iliskileri besleyin.',
    },
    health: {
      low: 'Fiziksel sagliginiza oncelik verin. Kucuk aliskanlik degisiklikleri buyuk fark yaratir.',
      medium: 'Sagliginiz iyi durumda. Tutarlilik ve onleyici bakim ile daha da iyilestirebilirsiniz.',
      high: 'Saglik ve enerji seviyeniz harika. Bu yasam tarzini surdurun.',
    },
    finance: {
      low: 'Finansal farkindalik ve butce yonetimi ile guvenlik duygunuzu artirabilirsiniz.',
      medium: 'Finansal durumunuz stabil. Birikim ve yatirim aliskanliklariyla buyutebilirsiniz.',
      high: 'Finansal guvenliginiz guclu. Bu ozgurlugu diger alanlara yansitabilirsiniz.',
    },
    growth: {
      low: 'Ogrenme ve gelisim firsatlari arayarak potansiyelinizi aciga cikarin.',
      medium: 'Gelisim yolculugunuzdasiniz. Sistematik ogrenme ile hizlanabilirsiniz.',
      high: 'Surekli gelisim mindsetiniz var. Ogrendiklerinizi uygulamaya odaklanin.',
    },
    balance: {
      low: 'Yasam dengesi onceliklerinizi gozden gecirin. Sinir koymak onemli.',
      medium: 'Dengenizi kuruyorsunuz. Zaman yonetimi teknikleriyle optimize edebilirsiniz.',
      high: 'Yasam dengeniz cok iyi. Bu armoniyi korumaya devam edin.',
    },
  };

  const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  return interpretations[category]?.[level] || '';
};

function ResultContent() {
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);
  const [testResult, setTestResult] = useState<{
    scores: Record<string, number>;
    duration: number;
    completedAt: string;
  } | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastLifeScoreResult');
    if (stored) {
      const data = JSON.parse(stored);
      setTestResult(data);
    }
  }, []);

  const generateReport = async () => {
    if (!testResult) return;
    setGenerating(true);
    setReportError(null);

    try {
      const response = await fetch('/api/tests/life-score-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: testResult.scores }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rapor olusturulamadi');
      }

      setAiReport(data.report);
    } catch (error) {
      console.error('AI rapor hatasi:', error);
      setReportError(error instanceof Error ? error.message : 'Rapor olusturulamadi');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      if (resultRef.current) {
        const canvas = await html2canvas(resultRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`thorius-hayat-skoru-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
    }
    setDownloading(false);
  };

  const handleSendEmail = async () => {
    if (!testResult || !aiReport) return;
    setSendingEmail(true);
    try {
      const response = await fetch('/api/tests/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'life-score',
          scores: testResult.scores,
          dimensions: CATEGORIES.map(cat => ({
            id: cat.id,
            name: cat.fullName,
            score: testResult.scores[cat.id] || 0,
            color: cat.color,
          })),
          overallScore: testResult.scores['overall'],
          overallLabel: 'Thorius Hayat Skoru',
          analysis: aiReport.summary,
          strengths: aiReport.topStrengths,
          developmentAreas: aiReport.priorityAreas,
          recommendations: aiReport.quickWins,
          duration: testResult.duration,
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

  if (!testResult) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sonuc bulunamadi.</p>
        <Link href="/tests/life-score">
          <Button className="mt-4">Yeni Test Baslat</Button>
        </Link>
      </div>
    );
  }

  const overallScore = testResult.scores['overall'] || 0;
  const lifeLevel = getLifeLevel(overallScore);

  // En yuksek ve en dusuk 3 alan
  const sortedCategories = CATEGORIES.map(cat => ({
    ...cat,
    score: testResult.scores[cat.id] || 0,
  })).sort((a, b) => b.score - a.score);

  const topAreas = sortedCategories.slice(0, 3);
  const lowAreas = sortedCategories.slice(-3).reverse();

  const radarData = CATEGORIES.map(cat => ({
    category: cat.name,
    value: testResult.scores[cat.id] || 0,
    fullMark: 100,
  }));

  const barData = CATEGORIES.map(cat => ({
    name: cat.name,
    value: testResult.scores[cat.id] || 0,
    color: cat.color,
  }));

  return (
    <div ref={resultRef} className="space-y-6">
      {/* Baslik */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thorius Hayat Skoru</h1>
        <p className="text-sm text-muted-foreground">
          {testResult.duration} dakikada tamamlandi
        </p>
      </div>

      {/* Genel Hayat Skoru */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-2xl border border-amber-500/30 p-6 text-center">
        <div className="text-6xl mb-2">{lifeLevel.emoji}</div>
        <div className="text-6xl font-bold mb-2" style={{ color: lifeLevel.color }}>
          {overallScore}
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
          style={{ backgroundColor: `${lifeLevel.color}20`, color: lifeLevel.color }}
        >
          <Award className="h-4 w-4" />
          {lifeLevel.level}
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{lifeLevel.description}</p>
      </div>

      {/* Guclu ve Gelisim Alanlari */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 rounded-2xl border border-green-500/30 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            En Guclu Alanlariniz
          </h3>
          <div className="space-y-2">
            {topAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">{i + 1}.</span>
                    <Icon className="h-4 w-4" style={{ color: area.color }} />
                    <span className="text-sm font-medium">{area.fullName}</span>
                  </div>
                  <span className="font-bold" style={{ color: area.color }}>%{area.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
            <Target className="h-5 w-5" />
            Oncelikli Gelisim Alanlari
          </h3>
          <div className="space-y-2">
            {lowAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-600">{i + 1}.</span>
                    <Icon className="h-4 w-4" style={{ color: area.color }} />
                    <span className="text-sm font-medium">{area.fullName}</span>
                  </div>
                  <span className="font-bold" style={{ color: area.color }}>%{area.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-center">Yasam Carkı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Skor"
                dataKey="value"
                stroke="#F59E0B"
                fill="url(#lifeGradient)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="lifeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-center">Alan Skorlari</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detayli Skorlar */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <h3 className="font-semibold mb-4">Detayli Alan Analizi</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map(cat => {
            const score = testResult.scores[cat.id] || 0;
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    </div>
                    <span className="font-medium text-sm">{cat.fullName}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: cat.color }}>
                    {score}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {getScoreInterpretation(cat.id, score)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Rapor */}
      {!aiReport ? (
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-2xl border border-amber-500/30 p-6 text-center">
          <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">AI Hayat Kocu Raporu</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Yapay zeka hayat kocunuz size ozel gelisim plani, hizli kazanimlar
            ve haftalik aksiyon plani olusturacak.
          </p>
          {reportError && (
            <p className="text-sm text-red-500 mb-4">{reportError}</p>
          )}
          <Button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rapor Olusturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Rapor Olustur
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ozet */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Hayat Kocu Yorumu
            </h3>
            <p className="text-muted-foreground leading-relaxed">{aiReport.summary}</p>
          </div>

          {/* Hizli Kazanimlar */}
          <div className="bg-green-500/10 rounded-2xl border border-green-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <Zap className="h-5 w-5" />
              Bu Hafta Yapabilecekleriniz (Hizli Kazanimlar)
            </h3>
            <ul className="space-y-2">
              {aiReport.quickWins.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Uzun Vadeli Hedefler */}
          <div className="bg-purple-500/10 rounded-2xl border border-purple-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-600">
              <Target className="h-5 w-5" />
              90 Gunluk Hedefler
            </h3>
            <ul className="space-y-2">
              {aiReport.longTermGoals.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Haftalik Plan */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <h3 className="font-semibold mb-4">7 Gunluk Aksiyon Plani</h3>
            <div className="space-y-3">
              {aiReport.weeklyPlan.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                    {item.day}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.focus}</p>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aksiyonlar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDownloadPDF}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          PDF Indir
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSendEmail}
          disabled={sendingEmail || emailSent || !aiReport}
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
          <Button variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Baska Test Coz
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function LifeScoreResultPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Testler
          </Link>

          <Suspense fallback={
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
              <p className="mt-4 text-muted-foreground">Yukleniyor...</p>
            </div>
          }>
            <ResultContent />
          </Suspense>
        </div>
      </main>
  );
}
