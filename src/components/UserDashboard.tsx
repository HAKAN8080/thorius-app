'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare, CheckCircle2, XCircle, BarChart3,
  ChevronRight, Loader2, Calendar, Target, X
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
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionsRes, limitsRes] = await Promise.all([
          fetch('/api/sessions').catch(() => null),
          fetch('/api/user/limits').catch(() => null),
        ]);

        if (!sessionsRes?.ok && !limitsRes?.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        if (sessionsRes?.ok) {
          const sessionsData = await sessionsRes.json().catch(() => ({ sessions: [] }));
          setSessions(sessionsData.sessions ?? []);
        }

        if (limitsRes?.ok) {
          const limitsData = await limitsRes.json().catch(() => null);
          if (limitsData) setLimits(limitsData);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-border bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </aside>
    );
  }

  const allHomework = (sessions ?? []).flatMap(s =>
    (s.homework ?? []).map(h => ({ ...h, sessionTitle: s.mentorTitle, sessionDate: s.createdAt }))
  );
  const completedHomework = allHomework.filter(h => h.completed);
  const pendingHomework = allHomework.filter(h => !h.completed);
  const lastSession = sessions?.[0];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all"
        title="Paneli aç"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-border bg-white/95 backdrop-blur-sm shadow-lg overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Panelim</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Seans Hakkı */}
        {limits && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Kalan seans:</span>
              <span className="font-bold text-foreground">
                {Math.max(0, limits.sessionLimit - limits.sessionCount)}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                style={{ width: `${Math.min((limits.sessionCount / limits.sessionLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="space-y-2">
          {/* Seanslarım */}
          <Link href="/profile" className="group block">
            <div className="rounded-xl border border-border bg-white p-3 transition-all hover:border-primary/30 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">Seanslarım</h3>
                  {lastSession ? (
                    <p className="text-xs text-muted-foreground truncate">
                      {lastSession.mentorTitle}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Henüz seans yok</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>

          {/* Ödevler */}
          <Link href="/profile" className="group block">
            <div className="rounded-xl border border-border bg-white p-3 transition-all hover:border-secondary/30 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">Ödevler</h3>
                  {allHomework.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600">{completedHomework.length} tamam</span>
                      <span className="text-amber-600">{pendingHomework.length} bekliyor</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Henüz ödev yok</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
            </div>
          </Link>

          {/* Gelişim Raporu */}
          <Link href="/profile/report" className="group block">
            <div className="rounded-xl border border-border bg-white p-3 transition-all hover:border-accent/30 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <BarChart3 className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">Gelişim Raporu</h3>
                  {allHomework.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      %{Math.round((completedHomework.length / allHomework.length) * 100)} tamamlandı
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Rapor için seans yap</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </div>
          </Link>
        </nav>

        {/* Bekleyen Ödevler */}
        {pendingHomework.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <h4 className="text-xs font-semibold text-amber-800 mb-2">Bekleyen Ödevler</h4>
            <div className="space-y-1.5">
              {pendingHomework.slice(0, 3).map((hw) => (
                <div key={hw.id} className="flex items-start gap-2 text-xs">
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span className="text-amber-700 line-clamp-1">{hw.text}</span>
                </div>
              ))}
              {pendingHomework.length > 3 && (
                <p className="text-xs text-amber-600 mt-1">
                  +{pendingHomework.length - 3} daha...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Son Seans */}
        {lastSession && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Son Seans
            </h4>
            <p className="text-sm font-medium text-foreground">{lastSession.mentorTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(lastSession.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
