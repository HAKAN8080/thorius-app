'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Crown,
  Shield,
  Activity,
  BarChart3,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface Stats {
  users: {
    total: number;
    free: number;
    essential: number;
    premium: number;
    verified: number;
  };
  sessions: {
    total: number;
    completed: number;
    active: number;
    rated: number;
  };
  nps: {
    average: number | null;
    score: number | null;
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
  };
  topMentors: Array<{ mentorId: string; count: number }>;
  dailySessions: Array<{ date: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Yetkisiz erişim');
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold text-destructive">{error}</p>
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    );
  }

  if (!stats) return null;

  const getNpsColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 50) return 'text-green-500';
    if (score >= 0) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Thorius yönetim merkezi</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Kullanıcılar
            </Button>
          </Link>
          <Link href="/admin/ratings">
            <Button variant="outline" className="gap-2">
              <Star className="h-4 w-4" />
              Değerlendirmeler
            </Button>
          </Link>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.users.verified} doğrulanmış
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Seans
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.sessions.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.sessions.completed} tamamlandı, {stats.sessions.active} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Değerlendirme Oranı
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.sessions.completed > 0
                ? Math.round((stats.sessions.rated / stats.sessions.completed) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.sessions.rated} / {stats.sessions.completed} seans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NPS Skoru
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getNpsColor(stats.nps.score)}`}>
              {stats.nps.score !== null ? stats.nps.score : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.nps.total} değerlendirme
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Plan Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Plan Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted" />
                  <span className="text-sm">Ücretsiz</span>
                </div>
                <span className="font-semibold">{stats.users.free}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Essential</span>
                </div>
                <span className="font-semibold">{stats.users.essential}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm">Premium</span>
                </div>
                <span className="font-semibold">{stats.users.premium}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NPS Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              NPS Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Promoters (9-10)</span>
                </div>
                <span className="font-semibold text-green-600">{stats.nps.promoters}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm">Passives (7-8)</span>
                </div>
                <span className="font-semibold text-amber-600">{stats.nps.passives}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Detractors (0-6)</span>
                </div>
                <span className="font-semibold text-red-600">{stats.nps.detractors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* En Çok Kullanılan Mentorlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Popüler Mentorlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topMentors.slice(0, 5).map((mentor, i) => (
                <div key={mentor.mentorId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm truncate max-w-[140px]">{mentor.mentorId}</span>
                  </div>
                  <span className="font-semibold">{mentor.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hızlı Erişim */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/users">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Kullanıcı Yönetimi</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.users.total} kullanıcı, seans geçmişi
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/ratings">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Değerlendirmeler</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.sessions.rated} değerlendirme, geri bildirimler
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
