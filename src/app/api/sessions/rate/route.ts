import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export interface SessionRating {
  contentQuality: number;      // İçerik yeterliliği
  sessionDuration: number;     // Süre yeterliliği
  responseSpeed: number;       // Yanıt süresi
  communication: number;       // İletişim ve odaklanma
  overall: number;             // Genel değerlendirme
  comment?: string;            // Opsiyonel yorum
  createdAt: string;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { sessionId, ratings, comment } = await req.json();

  if (!sessionId || !ratings) {
    return NextResponse.json({ error: 'Seans ID ve değerlendirmeler gerekli' }, { status: 400 });
  }

  // Değerlendirmeleri kontrol et (1-5 arası)
  const { contentQuality, sessionDuration, responseSpeed, communication, overall } = ratings;
  const allRatings = [contentQuality, sessionDuration, responseSpeed, communication, overall];

  if (allRatings.some(r => typeof r !== 'number' || r < 1 || r > 5)) {
    return NextResponse.json({ error: 'Değerlendirmeler 1-5 arası olmalı' }, { status: 400 });
  }

  // Session'ın bu kullanıcıya ait olduğunu kontrol et
  const sessionDoc = await getDb().collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists) {
    return NextResponse.json({ error: 'Seans bulunamadı' }, { status: 404 });
  }

  const sessionData = sessionDoc.data();
  if (sessionData?.userId !== user.id) {
    return NextResponse.json({ error: 'Bu seans size ait değil' }, { status: 403 });
  }

  // Değerlendirmeyi kaydet
  const rating: SessionRating = {
    contentQuality,
    sessionDuration,
    responseSpeed,
    communication,
    overall,
    comment: comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  await getDb().collection('sessions').doc(sessionId).update({
    rating,
    ratedAt: new Date().toISOString(),
  });

  // Ortalama hesapla
  const average = (contentQuality + sessionDuration + responseSpeed + communication + overall) / 5;

  return NextResponse.json({ success: true, average: Math.round(average * 10) / 10 });
}
