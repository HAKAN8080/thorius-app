import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

interface RatingWithDetails {
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

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  try {
    // Değerlendirme içeren seansları getir
    const sessionsSnap = await getDb().collection('sessions').get();
    const usersSnap = await getDb().collection('users').get();

    // Kullanıcı bilgilerini map'e al
    const usersMap = new Map<string, { email: string; name: string }>();
    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      usersMap.set(doc.id, { email: data.email, name: data.name });
    });

    // Değerlendirmeleri topla
    const ratings: RatingWithDetails[] = [];

    sessionsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.rating) {
        const userInfo = usersMap.get(data.userId);
        ratings.push({
          sessionId: doc.id,
          userId: data.userId,
          userEmail: userInfo?.email,
          userName: userInfo?.name,
          mentorId: data.mentorId,
          mentorName: data.mentorName,
          rating: data.rating,
          sessionCreatedAt: data.createdAt,
        });
      }
    });

    // Tarihe göre sırala (en yeni önce)
    ratings.sort((a, b) =>
      new Date(b.rating.createdAt).getTime() - new Date(a.rating.createdAt).getTime()
    );

    // Ortalama hesapla
    let totalOverall = 0;
    let totalNps = 0;
    const count = ratings.length;

    ratings.forEach((r) => {
      totalOverall += r.rating.overall;
      totalNps += r.rating.npsScore;
    });

    const averages = count > 0 ? {
      overall: Math.round((totalOverall / count) * 10) / 10,
      nps: Math.round((totalNps / count) * 10) / 10,
    } : null;

    return NextResponse.json({
      ratings,
      total: ratings.length,
      averages,
    });
  } catch (err) {
    console.error('Admin ratings error:', err);
    return NextResponse.json({ error: 'Değerlendirmeler yüklenemedi' }, { status: 500 });
  }
}
