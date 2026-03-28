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

  const sessionLimit = user.sessionLimit ?? (user.plan ? PLAN_LIMITS[user.plan] : 1);
  const db = getDb();

  // Transaction ile atomik limit kontrolü + seans oluşturma (race condition önlemi)
  let newSessionId: string;
  try {
    const newRef = db.collection('sessions').doc(); // önceden ID al
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(
        db.collection('sessions').where('userId', '==', user.id) as FirebaseFirestore.Query
      );
      if (snap.size >= sessionLimit) {
        throw new Error('SESSION_LIMIT_REACHED');
      }
      tx.set(newRef, {
        userId: user.id,
        mentorId,
        mentorName: mentorName || mentorId,
        mentorTitle: mentorTitle || '',
        createdAt: new Date().toISOString(),
        status: 'active',
        agenda: firstMessage.slice(0, 300),
        messageCount: 1,
        messages: [{ role: 'user', text: firstMessage }],
      });
    });
    newSessionId = newRef.id;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'SESSION_LIMIT_REACHED') {
      return NextResponse.json({ error: 'SESSION_LIMIT_REACHED', plan: user.plan ?? 'free' }, { status: 403 });
    }
    throw err;
  }

  return NextResponse.json({
    id: newSessionId,
    success: true,
    message: 'Seans başladı, hakkınız düşürüldü.'
  });
}
