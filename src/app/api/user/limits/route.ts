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
  const sessionCount = snap.size;

  const limitReached = sessionCount >= sessionLimit;

  return Response.json({ plan, sessionCount, sessionLimit, limitReached, isFree: !plan });
}
