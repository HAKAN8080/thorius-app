'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, Download, Share2, ArrowLeft, Sparkles, Loader2,
  TrendingUp, TrendingDown, Target, Heart, Users, Briefcase,
  RefreshCw
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';

// Kategoriler
const CATEGORIES = [
  { id: 'extraversion', name: 'Disadonukluk', color: '#FF6B6B', icon: Users },
  { id: 'agreeableness', name: 'Uyumluluk', color: '#4ECDC4', icon: Heart },
  { id: 'conscientiousness', name: 'Sorumluluk', color: '#45B7D1', icon: Target },
  { id: 'neuroticism', name: 'Duygusal Denge', color: '#96CEB4', icon: TrendingUp },
  { id: 'openness', name: 'Aciklik', color: '#DDA0DD', icon: Sparkles },
];

// Skor yorumlari
const getScoreInterpretation = (category: string, score: number) => {
  const interpretations: Record<string, { low: string; medium: string; high: string }> = {
    extraversion: {
      low: 'Icsel ve dusunceli bir yapisalliginiz var. Yalniz calismayi tercih edersiniz.',
      medium: 'Sosyal ve bireysel aktiviteler arasinda denge kurabiliyorsunuz.',
      high: 'Enerjik ve sosyal bir kisilige sahipsiniz. Insanlarla etkilesim sizi motive eder.',
    },
    agreeableness: {
      low: 'Bagimsiz ve elestirisel bir bakis aciniz var. Rekabetci ortamlarda basarili olursunuz.',
      medium: 'Isbirligi ve bireysel calisma arasinda denge kurabiliyorsunuz.',
      high: 'Empatik ve isbirlikci bir yaklasima sahipsiniz. Takim calismalarinda parlirsiniz.',
    },
    conscientiousness: {
      low: 'Esnek ve spontan bir yaklasim tercih ediyorsunuz. Yaratici alanlarda basarili olabilirsiniz.',
      medium: 'Planlama ve esneklik arasinda saglikli bir denge kurabiliyorsunuz.',
      high: 'Disiplinli ve hedef odakli bir kisilige sahipsiniz. Organize calismayi seversiniz.',
    },
    neuroticism: {
      low: 'Stres yonetimi konusunda zorluklar yasayabilirsiniz. Duygusal destek onemli.',
      medium: 'Duygularinizi genel olarak dengede tutabiliyorsunuz.',
      high: 'Duygusal olarak saglam ve direnclisiniz. Zor durumlarda sakinliginizi korursunuz.',
    },
    openness: {
      low: 'Pratik ve geleneksel yaklasimlari tercih ediyorsunuz. Somut sonuclar onemli.',
      medium: 'Yeni fikirler ve denenmis yontemler arasinda denge kurabiliyorsunuz.',
      high: 'Yaratici ve merakli bir kisilige sahipsiniz. Yeni deneyimlere aciksiniz.',
    },
  };

  const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  return interpretations[category]?.[level] || '';
};

// AI Rapor tipi
interface AIReport {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  careerSuggestions: string[];
  relationshipTips: string[];
  developmentPlan: { area: string; action: string }[];
}

function ResultContent() {
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);
  const [testResult, setTestResult] = useState<{
    scores: Record<string, number>;
    duration: number;
    completedAt: string;
  } | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastTestResult');
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
      const response = await fetch('/api/tests/personality-report', {
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
        pdf.save(`kisilik-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
    }
    setDownloading(false);
  };

  if (!testResult) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sonuc bulunamadi.</p>
        <Link href="/tests/personality">
          <Button className="mt-4">Yeni Test Baslat</Button>
        </Link>
      </div>
    );
  }

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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Kisilik Analizi Sonuclari</h1>
        <p className="text-sm text-muted-foreground">
          Big Five Kisilik Envanteri | {testResult.duration} dakikada tamamlandi
        </p>
      </div>

      {/* Grafikler */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-center">Kisilik Profili</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Skor"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-center">Kategori Skorlari</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
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
        <h3 className="font-semibold mb-4">Detayli Analiz</h3>
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
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/30 p-6 text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">AI Destekli Detayli Rapor</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Yapay zeka ile kisilik profilinizin detayli analizini, kariyer onerilerini
            ve gelisim planini olusturun.
          </p>
          {reportError && (
            <p className="text-sm text-red-500 mb-4">{reportError}</p>
          )}
          <Button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-primary to-secondary"
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
              <Sparkles className="h-5 w-5 text-primary" />
              AI Yorum
            </h3>
            <p className="text-muted-foreground leading-relaxed">{aiReport.summary}</p>
          </div>

          {/* Guclu Yonler */}
          <div className="bg-green-500/10 rounded-2xl border border-green-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Guclu Yonleriniz
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
              Gelisim Alanlari
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

          {/* Kariyer Onerileri */}
          <div className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
              <Briefcase className="h-5 w-5" />
              Kariyer Onerileri
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiReport.careerSuggestions.map((item, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Iliski Onerileri */}
          <div className="bg-pink-500/10 rounded-2xl border border-pink-500/30 p-4 sm:p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Heart className="h-5 w-5" />
              Iliski Onerileri
            </h3>
            <ul className="space-y-2">
              {aiReport.relationshipTips.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-pink-500 mt-1">•</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gelisim Plani */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
            <h3 className="font-semibold mb-4">30 Gunluk Gelisim Plani</h3>
            <div className="space-y-3">
              {aiReport.developmentPlan.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
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

export default function PersonalityResultPage() {
  return (
    <>
      <Navbar />
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
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Yukleniyor...</p>
            </div>
          }>
            <ResultContent />
          </Suspense>
        </div>
      </main>
    </>
  );
}
