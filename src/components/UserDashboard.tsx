'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare, CheckCircle2, XCircle, BarChart3,
  ChevronRight, Loader2, Calendar, Target
} from 'lucide-react';

interface Session {
  id: string;
  mentorTitle: string;
  createdAt: string;
  summary: string;
  homework: { id: string; text: string; completed: boolean }[];
}

interface UserLimits {
  plan: string | null;
  sessionCount: number;
  sessionLimit: number;
  limitReached: boolean;
}

export function UserDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionsRes, limitsRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/user/limits'),
        ]);

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.sessions ?? []);
        }

        if (limitsRes.ok) {
          const limitsData = await limitsRes.json();
          setLimits(limitsData);
        }
      } catch {
        // Hata durumunda sessiz kal
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Tüm ödevleri topla
  const allHomework = sessions.flatMap(s =>
    s.homework.map(h => ({ ...h, sessionTitle: s.mentorTitle, sessionDate: s.createdAt }))
  );
  const completedHomework = allHomework.filter(h => h.completed);
  const pendingHomework = allHomework.filter(h => !h.completed);

  // Son seans
  const lastSession = sessions[0];

  return (
    <section className="py-8 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Hoş Geldin!</h2>
          {limits && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>
                <strong className="text-foreground">{limits.sessionLimit - limits.sessionCount}</strong> seans hakkın kaldı
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Seanslarım */}
          <Link href="/profile" className="group">
            <div className="h-full rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Seanslarım</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>

              {lastSession ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Son seans: {new Date(lastSession.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm font-medium text-foreground">{lastSession.mentorTitle}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {lastSession.summary || 'Özet henüz oluşturulmadı.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz seans yok. Hemen başla!</p>
              )}
            </div>
          </Link>

          {/* Ödevler */}
          <Link href="/profile" className="group">
            <div className="h-full rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  </div>
                  <h3 className="font-semibold">Ödevler</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>

              {allHomework.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {completedHomework.length} tamamlandı
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <XCircle className="h-3.5 w-3.5" />
                      {pendingHomework.length} bekliyor
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {pendingHomework.slice(0, 2).map((hw) => (
                      <div key={hw.id} className="flex items-start gap-2 text-xs">
                        <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span className="text-muted-foreground line-clamp-1">{hw.text}</span>
                      </div>
                    ))}
                    {completedHomework.slice(0, 2 - pendingHomework.slice(0, 2).length).map((hw) => (
                      <div key={hw.id} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-muted-foreground line-clamp-1 line-through">{hw.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz ödev yok.</p>
              )}
            </div>
          </Link>

          {/* Gelişim Raporu */}
          <Link href="/profile/report" className="group">
            <div className="h-full rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <BarChart3 className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="font-semibold">Gelişim Raporu</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>

              {limits && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Seans Hakkı</span>
                    <span className="font-semibold">{limits.sessionCount} / {limits.sessionLimit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${Math.min((limits.sessionCount / limits.sessionLimit) * 100, 100)}%` }}
                    />
                  </div>
                  {allHomework.length > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Ödev Tamamlama</span>
                      <span className="font-semibold">
                        %{Math.round((completedHomework.length / allHomework.length) * 100)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">
                    Detaylı analiz için tıkla
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
