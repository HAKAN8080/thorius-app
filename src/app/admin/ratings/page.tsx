'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Loader2,
  Quote,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Rating {
  sessionId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  mentorId: string;
  mentorName?: string;
  rating: {
    contentQuality: number;
    sessionDuration: number;
    responseSpeed: number;
    communication: number;
    overall: number;
    npsScore: number;
    comment?: string;
    createdAt: string;
  };
  sessionCreatedAt: string;
}

export default function AdminRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averages, setAverages] = useState<{ overall: number; nps: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'with-comment' | 'low-nps'>('all');

  useEffect(() => {
    fetch('/api/admin/ratings')
      .then((r) => r.json())
      .then((data) => {
        setRatings(data.ratings || []);
        setAverages(data.averages);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRatings = ratings.filter((r) => {
    switch (filter) {
      case 'with-comment':
        return r.rating.comment && r.rating.comment.trim().length > 0;
      case 'low-nps':
        return r.rating.npsScore <= 6;
      default:
        return true;
    }
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNpsColor = (score: number) => {
    if (score >= 9) return 'bg-green-500 text-white';
    if (score >= 7) return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getNpsLabel = (score: number) => {
    if (score >= 9) return 'Promoter';
    if (score >= 7) return 'Passive';
    return 'Detractor';
  };

  const StarDisplay = ({ value }: { value: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3.5 w-3.5',
            star <= value
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Değerlendirmeler</h1>
          <p className="text-muted-foreground">{ratings.length} değerlendirme</p>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ortalama Puan</p>
              <p className="text-2xl font-bold">
                {averages?.overall?.toFixed(1) || '-'} <span className="text-base text-muted-foreground">/ 5</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ortalama NPS</p>
              <p className="text-2xl font-bold">
                {averages?.nps?.toFixed(1) || '-'} <span className="text-base text-muted-foreground">/ 10</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yorumlu</p>
              <p className="text-2xl font-bold">
                {ratings.filter(r => r.rating.comment).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tümü ({ratings.length})
        </Button>
        <Button
          variant={filter === 'with-comment' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('with-comment')}
          className="gap-1"
        >
          <Quote className="h-3 w-3" />
          Yorumlu ({ratings.filter(r => r.rating.comment).length})
        </Button>
        <Button
          variant={filter === 'low-nps' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('low-nps')}
          className="gap-1"
        >
          <TrendingDown className="h-3 w-3" />
          Düşük NPS ({ratings.filter(r => r.rating.npsScore <= 6).length})
        </Button>
      </div>

      {/* Değerlendirme Listesi */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-4 pr-4">
          {filteredRatings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Bu filtreye uygun değerlendirme yok</p>
              </CardContent>
            </Card>
          ) : (
            filteredRatings.map((r) => (
              <Card key={r.sessionId}>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Kullanıcı Bilgisi */}
                    <div>
                      <p className="font-medium">{r.userName || 'Anonim'}</p>
                      <p className="text-sm text-muted-foreground">{r.userEmail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mentor: {r.mentorName || r.mentorId}
                      </p>
                    </div>

                    {/* NPS */}
                    <div className="text-right">
                      <Badge className={cn('text-lg px-3 py-1', getNpsColor(r.rating.npsScore))}>
                        {r.rating.npsScore}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getNpsLabel(r.rating.npsScore)}
                      </p>
                    </div>
                  </div>

                  {/* Puanlar */}
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">İçerik</p>
                      <StarDisplay value={r.rating.contentQuality} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Süre</p>
                      <StarDisplay value={r.rating.sessionDuration} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Hız</p>
                      <StarDisplay value={r.rating.responseSpeed} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">İletişim</p>
                      <StarDisplay value={r.rating.communication} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Genel</p>
                      <StarDisplay value={r.rating.overall} />
                    </div>
                  </div>

                  {/* Yorum */}
                  {r.rating.comment && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm">{r.rating.comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Tarih */}
                  <p className="mt-3 text-xs text-muted-foreground text-right">
                    {formatDate(r.rating.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
