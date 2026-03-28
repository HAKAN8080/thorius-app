import { getCurrentUser, PlanType } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), { status: 401 });
  }

  if (user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim.' }), { status: 403 });
  }

  const { plan } = await req.json();

  const validPlans: PlanType[] = ['free', 'starter', 'pro', 'premium', 'kurumsal'];
  if (!validPlans.includes(plan)) {
    return new Response(JSON.stringify({ error: 'Geçersiz plan seçimi.' }), { status: 400 });
  }

  await getDb().collection('users').doc(user.id).update({
    plan,
    planActivatedAt: new Date().toISOString(),
  });

  return Response.json({ success: true, plan });
}
