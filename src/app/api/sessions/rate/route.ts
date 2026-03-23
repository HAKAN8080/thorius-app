import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export interface SessionRating {
  contentQuality: number;      // İçerik yeterliliği
  sessionDuration: number;     // Süre yeterliliği
  responseSpeed: number;       // Yanıt süresi
  communication: number;       // İletişim ve odaklanma
  overall: number;             // Genel değerlendirme
  npsScore: number;            // Net Promoter Score (0-10)
  comment?: string;            // Opsiyonel yorum
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('[RATE] Yetkisiz erişim');
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, ratings, npsScore, comment } = body;
    console.log('[RATE] Değerlendirme isteği:', { sessionId, userId: user.id, ratings, npsScore });

    if (!sessionId || !ratings) {
      console.log('[RATE] Eksik parametre:', { sessionId: !!sessionId, ratings: !!ratings });
      return NextResponse.json({ error: 'Seans ID ve değerlendirmeler gerekli' }, { status: 400 });
    }

    // Değerlendirmeleri kontrol et (1-5 arası)
    const { contentQuality, sessionDuration, responseSpeed, communication, overall } = ratings;
    const allRatings = [contentQuality, sessionDuration, responseSpeed, communication, overall];

    if (allRatings.some(r => typeof r !== 'number' || r < 1 || r > 5)) {
      console.log('[RATE] Geçersiz rating değerleri:', allRatings);
      return NextResponse.json({ error: 'Değerlendirmeler 1-5 arası olmalı' }, { status: 400 });
    }

    // NPS kontrolü (0-10 arası)
    if (typeof npsScore !== 'number' || npsScore < 0 || npsScore > 10) {
      console.log('[RATE] Geçersiz NPS:', npsScore);
      return NextResponse.json({ error: 'Öneri puanı 0-10 arası olmalı' }, { status: 400 });
    }

    // Session'ın bu kullanıcıya ait olduğunu kontrol et
    const sessionDoc = await getDb().collection('sessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      console.log('[RATE] Seans bulunamadı:', sessionId);
      return NextResponse.json({ error: 'Seans bulunamadı' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.userId !== user.id) {
      console.log('[RATE] Seans sahibi uyuşmazlığı:', { sessionUserId: sessionData?.userId, currentUserId: user.id });
      return NextResponse.json({ error: 'Bu seans size ait değil' }, { status: 403 });
    }

    // Değerlendirmeyi kaydet
    const rating: SessionRating = {
      contentQuality,
      sessionDuration,
      responseSpeed,
      communication,
      overall,
      npsScore,
      comment: comment?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await getDb().collection('sessions').doc(sessionId).update({
      rating,
      ratedAt: new Date().toISOString(),
    });

    // Ortalama hesapla
    const average = (contentQuality + sessionDuration + responseSpeed + communication + overall) / 5;

    console.log('[RATE] Değerlendirme kaydedildi:', { sessionId, average });
    return NextResponse.json({ success: true, average: Math.round(average * 10) / 10 });
  } catch (err) {
    console.error('[RATE] Beklenmeyen hata:', err);
    return NextResponse.json({ error: 'Değerlendirme kaydedilemedi - sunucu hatası' }, { status: 500 });
  }
}
