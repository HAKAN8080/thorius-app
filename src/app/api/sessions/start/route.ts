import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

// İlk mesaj gönderildiğinde çağrılır, seansı başlatır ve hakkı düşürür
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { mentorId, mentorName, mentorTitle, firstMessage } = await req.json();

  if (!mentorId || !firstMessage) {
    return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
  }

  // Seans limiti kontrolü
  const sessionLimit = user.sessionLimit ?? (user.plan ? PLAN_LIMITS[user.plan] : 1);
  const snap = await getDb().collection('sessions').where('userId', '==', user.id).get();

  if (snap.size >= sessionLimit) {
    return NextResponse.json({
      error: 'SESSION_LIMIT_REACHED',
      plan: user.plan ?? 'free'
    }, { status: 403 });
  }

  // Yeni seans oluştur (aktif durumda)
  const sessionDoc = {
    userId: user.id,
    mentorId,
    mentorName: mentorName || mentorId,
    mentorTitle: mentorTitle || '',
    createdAt: new Date().toISOString(),
    status: 'active', // aktif seans
    agenda: firstMessage.slice(0, 300),
    messageCount: 1,
    messages: [{ role: 'user', text: firstMessage }],
  };

  const ref = await getDb().collection('sessions').add(sessionDoc);

  return NextResponse.json({
    id: ref.id,
    success: true,
    message: 'Seans başladı, hakkınız düşürüldü.'
  });
}
