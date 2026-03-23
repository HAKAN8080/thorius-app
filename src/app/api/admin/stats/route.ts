import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  try {
    const usersSnap = await getDb().collection('users').get();
    const sessionsSnap = await getDb().collection('sessions').get();

    // Temel istatistikler
    const totalUsers = usersSnap.size;
    const totalSessions = sessionsSnap.size;

    // Plan dağılımı
    let freeUsers = 0;
    let essentialUsers = 0;
    let premiumUsers = 0;
    let verifiedUsers = 0;

    usersSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.plan === 'premium') premiumUsers++;
      else if (data.plan === 'essential') essentialUsers++;
      else freeUsers++;

      if (data.emailVerified) verifiedUsers++;
    });

    // Seans durumu
    let completedSessions = 0;
    let activeSessions = 0;
    let ratedSessions = 0;
    let totalNps = 0;
    let npsCount = 0;

    // Mentor kullanımı
    const mentorUsage: Record<string, number> = {};

    // Günlük seans sayıları (son 30 gün)
    const dailySessions: Record<string, number> = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    sessionsSnap.docs.forEach((doc) => {
      const data = doc.data();

      if (data.status === 'completed') completedSessions++;
      else activeSessions++;

      if (data.rating) {
        ratedSessions++;
        if (typeof data.rating.npsScore === 'number') {
          totalNps += data.rating.npsScore;
          npsCount++;
        }
      }

      // Mentor kullanımı
      const mentorId = data.mentorId || 'unknown';
      mentorUsage[mentorId] = (mentorUsage[mentorId] || 0) + 1;

      // Günlük seans
      if (data.createdAt) {
        const date = new Date(data.createdAt);
        if (date >= thirtyDaysAgo) {
          const dateKey = date.toISOString().split('T')[0];
          dailySessions[dateKey] = (dailySessions[dateKey] || 0) + 1;
        }
      }
    });

    // NPS hesapla
    const averageNps = npsCount > 0 ? Math.round((totalNps / npsCount) * 10) / 10 : null;

    // NPS kategorileri
    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    sessionsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.rating?.npsScore !== undefined) {
        const score = data.rating.npsScore;
        if (score >= 9) promoters++;
        else if (score >= 7) passives++;
        else detractors++;
      }
    });

    const npsScore = npsCount > 0
      ? Math.round(((promoters - detractors) / npsCount) * 100)
      : null;

    // Mentor kullanımını sırala
    const topMentors = Object.entries(mentorUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([mentorId, count]) => ({ mentorId, count }));

    // Günlük seansları sırala
    const dailySessionsArray = Object.entries(dailySessions)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        essential: essentialUsers,
        premium: premiumUsers,
        verified: verifiedUsers,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        active: activeSessions,
        rated: ratedSessions,
      },
      nps: {
        average: averageNps,
        score: npsScore,
        promoters,
        passives,
        detractors,
        total: npsCount,
      },
      topMentors,
      dailySessions: dailySessionsArray,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'İstatistikler yüklenemedi' }, { status: 500 });
  }
}
