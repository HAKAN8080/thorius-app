import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { sessionId } = await params;
  const { homeworkId, completed } = await req.json();

  const ref = getDb().collection('sessions').doc(sessionId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== user.id) {
    return new Response(JSON.stringify({ error: 'Bulunamadı' }), { status: 404 });
  }

  const homework = doc.data()?.homework ?? [];
  const updated = homework.map((item: { id: string; text: string; completed: boolean }) =>
    item.id === homeworkId ? { ...item, completed } : item
  );

  await ref.update({ homework: updated });
  return Response.json({ ok: true });
}
