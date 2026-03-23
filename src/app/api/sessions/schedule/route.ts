import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET — kullanıcının planlanmış seanslarını getir
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    const snap = await getDb()
      .collection('scheduled_sessions')
      .where('userId', '==', user.id)
      .get();

    const sessions = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return Response.json({ sessions });
  } catch (err) {
    console.error('[SCHEDULE GET] Error:', err);
    return Response.json({ sessions: [], error: String(err) });
  }
}

// POST — yeni seans planla
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { scheduledAt, mentorId, mentorTitle } = await req.json();

  if (!scheduledAt || !mentorId) {
    return Response.json({ error: 'Tarih ve mentor gerekli' }, { status: 400 });
  }

  // Geçmiş tarih kontrolü
  if (new Date(scheduledAt) <= new Date()) {
    return Response.json({ error: 'Geçmiş tarih seçilemez' }, { status: 400 });
  }

  // Planlanmış seans limitini kontrol et
  const sessionLimit = user.sessionLimit ?? (user.plan ? PLAN_LIMITS[user.plan] : 1);
  const usedSnap = await getDb().collection('sessions').where('userId', '==', user.id).get();
  const scheduledSnap = await getDb().collection('scheduled_sessions').where('userId', '==', user.id).get();
  const totalUsed = usedSnap.size + scheduledSnap.size;

  if (totalUsed >= sessionLimit) {
    return Response.json({ error: 'Seans limitiniz doldu' }, { status: 403 });
  }

  const doc = {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    mentorId,
    mentorTitle,
    scheduledAt,
    reminderSent: false,
    createdAt: new Date().toISOString(),
  };

  const ref = await getDb().collection('scheduled_sessions').add(doc);
  return Response.json({ id: ref.id, ...doc });
}

// DELETE — planlanmış seansı iptal et
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  const { id } = await req.json();
  const doc = await getDb().collection('scheduled_sessions').doc(id).get();

  if (!doc.exists || doc.data()?.userId !== user.id) {
    return Response.json({ error: 'Bulunamadı' }, { status: 404 });
  }

  await doc.ref.delete();
  return Response.json({ success: true });
}
