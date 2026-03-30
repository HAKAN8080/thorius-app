'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, CheckCircle2, Sparkles, ArrowRight, Loader2, RefreshCw, Zap, Users, Calendar, Award } from 'lucide-react';
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

interface UserLimits {
  plan: string | null;
  sessionCount: number;
  sessionLimit: number;
  limitReached: boolean;
}

interface Session {
  id: string;
  mentorId: string;
  mentorTitle: string;
  createdAt: string;
  status?: string;
  summary?: string;
  homework: { id: string; text: string; completed: boolean }[];
}

interface CoachStats {
  mentorId: string;
  mentorTitle: string;
  sessionCount: number;
  totalHomework: number;
  completedHomework: number;
  completionRate: number;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchReport() {
    setLoading(true);
    try {
      const [reportRes, limitsRes, sessionsRes] = await Promise.all([
        fetch('/api/report'),
        fetch('/api/user/limits'),
        fetch('/api/sessions'),
      ]);

      const reportData = await reportRes.json();
      if (reportData.report) {
        setReport(reportData.report);
      } else {
        setMessage(reportData.message ?? 'Rapor oluşturulamadı.');
      }

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        setLimits(limitsData);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        // Sadece tamamlanmış seansları istatistiklerde göster
        const completedSessions = (sessionsData.sessions ?? []).filter(
          (s: Session) => s.status === 'completed' || s.summary
        );
        setSessions(completedSessions);
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

  // Koç bazlı istatistikleri hesapla
  const coachStats: CoachStats[] = [];
  const coachMap = new Map<string, CoachStats>();

  (sessions ?? []).forEach(session => {
    const existing = coachMap.get(session.mentorId);
    const homework = session.homework ?? [];
    const completed = homework.filter(h => h.completed).length;

    if (existing) {
      existing.sessionCount++;
      existing.totalHomework += homework.length;
      existing.completedHomework += completed;
    } else {
      coachMap.set(session.mentorId, {
        mentorId: session.mentorId,
        mentorTitle: session.mentorTitle,
        sessionCount: 1,
        totalHomework: homework.length,
        completedHomework: completed,
        completionRate: 0,
      });
    }
  });

  coachMap.forEach(stats => {
    stats.completionRate = stats.totalHomework > 0
      ? Math.round((stats.completedHomework / stats.totalHomework) * 100)
      : 0;
    coachStats.push(stats);
  });

  // En çok seans yapılan koçu bul
  coachStats.sort((a, b) => b.sessionCount - a.sessionCount);

  const completionColor =
    !report ? '' :
    report.homeworkCompletionRate >= 75 ? 'text-green-500' :
    report.homeworkCompletionRate >= 40 ? 'text-amber-500' :
    'text-rose-500';

  // Toplam ödev sayısı
  const totalHomeworkAll = (sessions ?? []).reduce((acc, s) => acc + (s.homework?.length ?? 0), 0);
  const completedHomeworkAll = (sessions ?? []).reduce((acc, s) => acc + (s.homework?.filter(h => h.completed).length ?? 0), 0);
  const overallCompletionRate = totalHomeworkAll > 0 ? Math.round((completedHomeworkAll / totalHomeworkAll) * 100) : 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

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
              Tüm seanslarınız ve ödevleriniz analiz edilerek hazırlanmıştır.
            </p>
          </div>
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
        ) : (
          <div className="space-y-6">

            {/* Seans Hakkı Kartı */}
            {limits && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Seans Hakkı</h3>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {limits.plan ? limits.plan.charAt(0).toUpperCase() + limits.plan.slice(1) : 'Ücretsiz'} Plan
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{limits.sessionLimit}</p>
                    <p className="text-xs text-muted-foreground">Toplam Hak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{limits.sessionCount}</p>
                    <p className="text-xs text-muted-foreground">Kullanılan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{Math.max(0, limits.sessionLimit - limits.sessionCount)}</p>
                    <p className="text-xs text-muted-foreground">Kalan</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${Math.min((limits.sessionCount / limits.sessionLimit) * 100, 100)}%` }}
                  />
                </div>
                {limits.limitReached && (
                  <p className="mt-3 text-xs text-amber-600 font-medium">
                    Seans hakkınız doldu. Devam etmek için paket yükseltin.
                  </p>
                )}
              </div>
            )}

            {/* Genel İstatistikler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Toplam Seans</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <Users className="h-5 w-5 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold text-secondary">{coachStats.length}</p>
                <p className="text-xs text-muted-foreground">Farklı Koç/Mentor</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{completedHomeworkAll}/{totalHomeworkAll}</p>
                <p className="text-xs text-muted-foreground">Ödev Tamamlandı</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
                <Award className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                <p className={`text-2xl font-bold ${overallCompletionRate >= 75 ? 'text-green-600' : overallCompletionRate >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                  %{overallCompletionRate}
                </p>
                <p className="text-xs text-muted-foreground">Genel Başarı</p>
              </div>
            </div>

            {/* Koç/Mentor Bazlı Rapor */}
            {coachStats.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Koç/Mentor Bazlı Performans</h2>
                </div>
                <div className="space-y-3">
                  {coachStats.map((coach) => (
                    <div key={coach.mentorId} className="rounded-xl border border-border/30 bg-background/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{coach.mentorTitle}</h3>
                        <span className="text-xs text-muted-foreground">{coach.sessionCount} seans</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>{coach.completedHomework}/{coach.totalHomework} ödev</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                coach.completionRate >= 75 ? 'bg-green-500' :
                                coach.completionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${coach.completionRate}%` }}
                            />
                          </div>
                        </div>
                        <span className={`font-semibold ${
                          coach.completionRate >= 75 ? 'text-green-600' :
                          coach.completionRate >= 40 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          %{coach.completionRate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Raporu (varsa) */}
            {report ? (
              <>
                {/* Overall Summary */}
                <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold">AI Değerlendirmesi</h2>
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
              </>
            ) : (
              /* No AI Report - Show basic stats message */
              sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 py-16 text-center">
                  <BarChart3 className="mb-4 h-10 w-10 text-muted-foreground/40" />
                  <h3 className="font-semibold">Henüz seans yok</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{message || 'İlk seansınızı yaparak gelişim raporunuzu oluşturun.'}</p>
                  <Link href="/mentors" className="mt-4">
                    <Button size="sm" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                      İlk Seansı Başlat
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <h3 className="font-semibold">AI Değerlendirmesi</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {message || 'Seanslarınızı sonlandırarak detaylı AI analizi oluşturabilirsiniz.'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Not: Rapor için seansların "sonlandırılmış" olması gerekir.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
