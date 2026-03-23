'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, CheckCircle2, Sparkles, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Report {
  overallSummary: string;
  strengths: string[];
  growthAreas: string[];
  homeworkCompletionRate: number;
  patterns: string;
  nextSteps: string[];
  totalSessions: number;
  totalHomework: number;
  completedHomework: number;
  generatedAt: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch('/api/report');
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      } else {
        setMessage(data.message ?? 'Rapor oluşturulamadı.');
      }
    } catch {
      setMessage('Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  const completionColor =
    !report ? '' :
    report.homeworkCompletionRate >= 75 ? 'text-green-500' :
    report.homeworkCompletionRate >= 40 ? 'text-amber-500' :
    'text-rose-500';

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Gelişim Raporum</h1>
            </div>
            <p className="text-muted-foreground">
              Tüm seanslarınız analiz edilerek hazırlanmıştır.
            </p>
          </div>
          {report && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={fetchReport}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Rapor hazırlanıyor</p>
              <p className="text-sm text-muted-foreground mt-1">Seanslarınız analiz ediliyor...</p>
            </div>
          </div>
        ) : !report ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 py-16 text-center">
            <BarChart3 className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-semibold">Rapor oluşturulamadı</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            {message.includes('seans') && (
              <Link href="/mentors" className="mt-4">
                <Button size="sm" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                  İlk Seansı Başlat
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-primary">{report.totalSessions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Seans</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-secondary">{report.completedHomework}/{report.totalHomework}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ödev Tamamlandı</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <p className={`text-2xl font-bold ${completionColor}`}>%{report.homeworkCompletionRate}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tamamlama Oranı</p>
              </div>
            </div>

            {/* Overall Summary */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Genel Değerlendirme</h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{report.overallSummary}</p>
            </div>

            {/* Patterns */}
            {report.patterns && (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <h2 className="font-semibold">Öne Çıkan Temalar</h2>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{report.patterns}</p>
              </div>
            )}

            {/* Strengths + Growth Areas */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h2 className="font-semibold">Güçlü Yönler</h2>
                </div>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <h2 className="font-semibold">Gelişim Alanları</h2>
                </div>
                <ul className="space-y-2">
                  {report.growthAreas.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Önerilen Sonraki Adımlar</h2>
              </div>
              <ol className="space-y-3">
                {report.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/85 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Generated At */}
            <p className="text-center text-xs text-muted-foreground/60">
              {new Date(report.generatedAt).toLocaleString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })} tarihinde oluşturuldu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
