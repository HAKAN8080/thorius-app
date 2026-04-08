import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { getDb } from '@/lib/db';

const FREE_SESSION_LIMIT = 1;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const plan = user.plan ?? null;
  const sessionLimit = user.sessionLimit ?? (plan ? PLAN_LIMITS[plan] : FREE_SESSION_LIMIT);

  const snap = await getDb()
    .collection('sessions')
    .where('userId', '==', user.id)
    .get();

  // Aktif ve tamamlanmış seansları ayır
  const activeSessions = snap.docs.filter(d => d.data().status === 'active');
  const completedSessions = snap.docs.filter(d => d.data().status === 'completed' || !d.data().status);

  // Toplam seans sayısı (tamamlanmış + aktif)
  const sessionCount = snap.size;
  // Tamamlanmış seans sayısı
  const completedCount = completedSessions.length;
  // Aktif seans var mı?
  const hasActiveSession = activeSessions.length > 0;

  // Limit kontrolü: Aktif seans varsa limit dolmamış sayılır (devam edebilir)
  // Aktif seans yoksa, tamamlanmış seanslar limite ulaştıysa limit dolmuş
  const limitReached = !hasActiveSession && completedCount >= sessionLimit;

  return Response.json({
    plan,
    sessionCount,
    completedCount,
    sessionLimit,
    limitReached,
    hasActiveSession,
    isFree: !plan,
  });
}
