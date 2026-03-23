'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Calendar, MessageCircle, BookOpen, BarChart3, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DEFAULT_MENTORS } from '@/lib/types';

interface ScheduledSession {
  id: string;
  mentorId: string;
  mentorTitle: string;
  scheduledAt: string;
  reminderSent: boolean;
}

interface HomeworkItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorTitle: string;
  createdAt: string;
  summary: string;
  homework: HomeworkItem[];
  messageCount: number;
}

function SessionCard({ session, onToggleHomework }: {
  session: Session;
  onToggleHomework: (sessionId: string, homeworkId: string, completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = session.homework.filter((h) => h.completed).length;
  const date = new Date(session.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-200">
      {/* Card Header */}
      <button
        className="w-full p-5 text-left hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{session.mentorTitle}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {date}
                </span>
                <span>{session.messageCount} mesaj</span>
                {session.homework.length > 0 && (
                  <span className={completedCount === session.homework.length ? 'text-green-500' : 'text-amber-500'}>
                    {completedCount}/{session.homework.length} ödev tamamlandı
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {/* Summary preview */}
        {!expanded && session.summary && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 pl-12">{session.summary}</p>
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-5">
          {/* Summary */}
          {session.summary && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Seans Özeti
              </div>
              <p className="text-sm leading-relaxed">{session.summary}</p>
            </div>
          )}

          {/* Homework */}
          {session.homework.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Ödevler & Eylem Adımları</p>
              <ul className="space-y-2">
                {session.homework.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onToggleHomework(session.id, item.id, !item.completed)}
                      className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/5"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className={`text-sm leading-relaxed ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AuthUser { name: string; email: string; plan?: string; }

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  premium: { label: 'Premium Üye', className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  essential: { label: 'Essential Üye', className: 'bg-primary/15 text-primary border border-primary/30' },
};

export default function ProfilePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledSession[]>([]);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedMentor, setSchedMentor] = useState('');
  const [schedLoading, setSchedLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => {});

    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/sessions/schedule')
      .then((r) => r.json())
      .then((data) => setScheduled(data.sessions ?? []))
      .catch(() => {});
  }, []);

  async function handleSchedule() {
    if (!schedDate || !schedTime || !schedMentor) return;
    setSchedLoading(true);
    const mentor = DEFAULT_MENTORS.find((m) => m.id === schedMentor);
    const scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString();
    const res = await fetch('/api/sessions/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt, mentorId: schedMentor, mentorTitle: mentor?.title ?? schedMentor }),
    });
    const data = await res.json();
    if (res.ok) {
      setScheduled((prev) => [...prev, data].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
      setSchedDate(''); setSchedTime(''); setSchedMentor('');
    } else {
      alert(data.error ?? 'Bir hata oluştu');
    }
    setSchedLoading(false);
  }

  async function handleCancelScheduled(id: string) {
    await fetch('/api/sessions/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setScheduled((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleToggleHomework(sessionId: string, homeworkId: string, completed: boolean) {
    // Optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, homework: s.homework.map((h) => h.id === homeworkId ? { ...h, completed } : h) }
          : s
      )
    );
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeworkId, completed }),
    });
  }

  const totalHomework = sessions.reduce((acc, s) => acc + s.homework.length, 0);
  const completedHomework = sessions.reduce((acc, s) => acc + s.homework.filter((h) => h.completed).length, 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            {user && (
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg leading-tight">{user.name}</p>
                  {user.plan && PLAN_BADGE[user.plan] && (
                    <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[user.plan].className}`}>
                      {PLAN_BADGE[user.plan].label}
                    </span>
                  )}
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold">Geçmiş Seanslarım</h1>
            <p className="mt-1 text-muted-foreground">Görüşme özetleri ve ödevlerin</p>
          </div>
          <Link href="/profile/report" className="shrink-0">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-secondary to-primary hover:opacity-90">
              <BarChart3 className="h-4 w-4" />
              Gelişim Raporum
            </Button>
          </Link>
        </div>

        {/* Takvim — Seans Planlama */}
        {user?.plan && (
          <div className="mb-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="font-semibold">Seans Planla</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={schedMentor}
                  onChange={(e) => setSchedMentor(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Mentor / Koç Seç</option>
                  {DEFAULT_MENTORS.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={schedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button
                onClick={handleSchedule}
                disabled={!schedDate || !schedTime || !schedMentor || schedLoading}
                size="sm"
                className="gap-2 bg-gradient-to-r from-secondary to-primary hover:opacity-90"
              >
                <Calendar className="h-3.5 w-3.5" />
                {schedLoading ? 'Ekleniyor...' : 'Takvime Ekle'}
              </Button>

              {/* Planlanmış seanslar */}
              {scheduled.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Planlanmış Seanslar</p>
                  {scheduled.map((s) => {
                    const d = new Date(s.scheduledAt);
                    const isPast = d < new Date();
                    return (
                      <div key={s.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isPast ? 'opacity-50 border-border/30 bg-muted/20' : 'border-primary/20 bg-primary/5'}`}>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{s.mentorTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {!isPast && (
                          <button onClick={() => handleCancelScheduled(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-primary">{sessions.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Seans</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-secondary">{totalHomework}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toplam Ödev</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/40 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold text-green-500">{completedHomework}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tamamlanan</p>
            </div>
          </div>
        )}

        {/* Sessions */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl border border-border/50 bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 py-16 text-center">
            <MessageCircle className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-semibold">Henüz seans yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bir koç veya mentorla sohbet tamamladıktan sonra özetler burada görünecek.
            </p>
            <Link href="/mentors" className="mt-4">
              <Button size="sm" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                Seans Başlat
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onToggleHomework={handleToggleHomework}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
