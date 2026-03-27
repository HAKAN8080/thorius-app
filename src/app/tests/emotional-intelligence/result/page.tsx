'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart, Download, ArrowLeft, Sparkles, Loader2,
  TrendingUp, Target, Users, Briefcase, Shield, Brain,
  RefreshCw, Award, Zap, Mail, Check
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

// Kategoriler
const CATEGORIES = [
  { id: 'self-awareness', name: 'Oz Farkindalik', color: '#8B5CF6', icon: Brain },
  { id: 'self-management', name: 'Oz Yonetim', color: '#EC4899', icon: Target },
  { id: 'social-awareness', name: 'Sosyal Farkindalik', color: '#06B6D4', icon: Users },
  { id: 'relationship-management', name: 'Iliski Yonetimi', color: '#10B981', icon: Heart },
  { id: 'stress-management', name: 'Stres Yonetimi', color: '#F59E0B', icon: Shield },
];

// AI Rapor tipi
interface AIReport {
  summary: string;
  eqLevel: string;
  strengths: string[];
  developmentAreas: string[];
  workplaceTips: string[];
  leadershipTips: string[];
  developmentPlan: { area: string; action: string }[];
}

// Skor yorumlari
const getScoreInterpretation = (category: string, score: number) => {
  const interpretations: Record<string, { low: string; medium: string; high: string }> = {
    'self-awareness': {
      low: 'Duygusal farkindalik alaninida gelistirmeye acik alanlar var. Duygularinizi tanima pratigi yapmaniz faydali olabilir.',
      medium: 'Duygularinizin genellikle farkindaysiniz. Bu beceriyi daha da gelistirebilirsiniz.',
      high: 'Kendi duygularinizi cok iyi taniyorsunuz. Bu guclu oz farkindalik liderlik icin onemli bir temel.',
    },
    'self-management': {
      low: 'Duygu yonetimi konusunda destek alabilirsiniz. Mindfulness teknikleri yardimci olabilir.',
      medium: 'Duygularinizi genel olarak iyi yonetiyorsunuz. Bazi durumlarda daha fazla kontrol saglayabilirsiniz.',
      high: 'Duygusal oz kontrolunuz cok guclu. Zor durumlarda bile sakinliginizi koruyabiliyorsunuz.',
    },
    'social-awareness': {
      low: 'Empati becerilerinizi gelistirmek iliskilerinizi guclendirebilir.',
      medium: 'Baskalarinin duygularini anlama konusunda yetkin bir seviyedesiniz.',
      high: 'Sosyal farkindalginiz cok yuksek. Baskalarinin duygularini kolayca okuyabiliyorsunuz.',
    },
    'relationship-management': {
      low: 'Iliski yonetimi becerilerinizi gelistirmek kariyer ve ozel hayatiniza olumlu yansiyacaktir.',
      medium: 'Iliskilerinizi genel olarak iyi yonetiyorsunuz. Bazi alanlarda daha da gelistirmeniz mumkun.',
      high: 'Iliski yonetiminde cok basarilisiniz. Insanlarla etkili baglantilar kurabiliyorsunuz.',
    },
    'stress-management': {
      low: 'Stres yonetimi teknikleri ogrenmek genel sagliginiz icin faydali olacaktir.',
      medium: 'Stresle basa cikmada ortalama bir seviyedesiniz. Daha etkili teknikleri deneyebilirsiniz.',
      high: 'Stres yonetimi konusunda cok basarilisiniz. Zor zamanlarda bile dengenizi koruyabiliyorsunuz.',
    },
  };

  const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  return interpretations[category]?.[level] || '';
};

// EQ seviye yorumu
const getEQLevel = (score: number) => {
  if (score >= 80) return { level: 'Cok Yuksek', color: '#10B981', description: 'Duygusal zeka konusunda ustalasmisiniz.' };
  if (score >= 65) return { level: 'Yuksek', color: '#06B6D4', description: 'Guclu duygusal zeka becerilerine sahipsiniz.' };
  if (score >= 50) return { level: 'Orta', color: '#F59E0B', description: 'Iyi bir temele sahipsiniz, gelistirmeye devam edin.' };
  if (score >= 35) return { level: 'Gelismeye Acik', color: '#F97316', description: 'Duygusal zeka becerilerinizi gelistirme firsatiniz var.' };
  return { level: 'Baslangic', color: '#EF4444', description: 'Duygusal zeka yolculugunuza baslayin.' };
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
    const stored = localStorage.getItem('lastEQTestResult');
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
      const response = await fetch('/api/tests/eq-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: testResult.scores }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rapor oluşturulamadı');
      }

      setAiReport(data.report);
    } catch (error) {
      console.error('AI rapor hatası:', error);
      setReportError(error instanceof Error ? error.message : 'Rapor oluşturulamadı');
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
        pdf.save(`duygusal-zeka-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
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
          testType: 'emotional-intelligence',
          scores: testResult.scores,
          dimensions: CATEGORIES.map(cat => ({
            id: cat.id,
            name: cat.name,
            score: testResult.scores[cat.id] || 0,
            color: cat.color,
          })),
          overallScore: testResult.scores['overall'],
          overallLabel: 'Duygusal Zeka Skoru',
          analysis: aiReport.summary,
          strengths: aiReport.strengths,
          developmentAreas: aiReport.developmentAreas,
          recommendations: aiReport.workplaceTips,
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
        <Link href="/tests/emotional-intelligence">
          <Button className="mt-4">Yeni Test Baslat</Button>
        </Link>
      </div>
    );
  }

  const overallScore = testResult.scores['overall'] || 0;
  const eqLevel = getEQLevel(overallScore);

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Duygusal Zeka Sonuclari</h1>
        <p className="text-sm text-muted-foreground">
          EQ-i (Bar-On, 1997) | {testResult.duration} dakikada tamamlandi
        </p>
      </div>

      {/* Genel EQ Skoru */}
      <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl border border-pink-500/30 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="h-6 w-6 text-pink-500" />
          <span className="text-sm font-medium text-pink-600">Genel Duygusal Zeka Skoru</span>
        </div>
        <div className="text-5xl font-bold mb-2" style={{ color: eqLevel.color }}>
          {overallScore}
        </div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${eqLevel.color}20`, color: eqLevel.color }}
        >
          <Zap className="h-4 w-4" />
          {eqLevel.level}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{eqLevel.description}</p>
      </div>

      {/* Grafikler */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-center">EQ Profili</h3>
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
                stroke="#EC4899"
                fill="#EC4899"
                fillOpacity={0.3}
                strokeWidth={2}
              />
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
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
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
        <div className="space-y-4">
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
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: cat.color }}>
                    %{score}
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
                <p className="text-sm text-muted-foreground">
                  {getScoreInterpretation(cat.id, score)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Rapor */}
      {!aiReport ? (
        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl border border-pink-500/30 p-6 text-center">
          <Sparkles className="h-10 w-10 text-pink-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">AI Destekli Detayli EQ Raporu</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Yapay zeka ile duygusal zeka profilinizin detayli analizini, is hayati onerilerini
            ve liderlik gelistirme planini olusturun.
          </p>
          {reportError && (
            <p className="text-sm text-red-500 mb-4">{reportError}</p>
          )}
          <Button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-pink-500 to-rose-600"
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
              <Sparkles className="h-5 w-5 text-pink-500" />
              AI Yorum - {aiReport.eqLevel}
            </h3>
            <p className="text-muted-foreground leading-relaxed">{aiReport.summary}</p>
          </div>

          {/* Guclu Yonler */}
          <div className="bg-green-500/10 rounded-2xl border border-green-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Guclu EQ Alanlariniz
            </h3>
            <ul className="space-y-2">
              {aiReport.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gelisim Alanlari */}
          <div className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
              <Target className="h-5 w-5" />
              Gelisim Firsatlari
            </h3>
            <ul className="space-y-2">
              {aiReport.developmentAreas.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Is Hayati Onerileri */}
          <div className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
              <Briefcase className="h-5 w-5" />
              Is Hayatinda EQ Kullanimi
            </h3>
            <ul className="space-y-2">
              {aiReport.workplaceTips.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Liderlik Onerileri */}
          <div className="bg-purple-500/10 rounded-2xl border border-purple-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-600">
              <Award className="h-5 w-5" />
              Liderlik Gelistirme
            </h3>
            <ul className="space-y-2">
              {aiReport.leadershipTips.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gelisim Plani */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <h3 className="font-semibold mb-4">30 Gunluk EQ Gelistirme Plani</h3>
            <div className="space-y-3">
              {aiReport.developmentPlan.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-pink-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.area}</p>
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

export default function EmotionalIntelligenceResultPage() {
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
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
              <p className="mt-4 text-muted-foreground">Yukleniyor...</p>
            </div>
          }>
            <ResultContent />
          </Suspense>
        </div>
      </main>
  );
}
