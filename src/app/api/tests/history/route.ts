import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const snap = await getDb()
      .collection('sessions')
      .where('userId', '==', user.id)
      .where('type', '==', 'personality-test')
      .get();

    const tests = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return Response.json({ tests });
  } catch (error) {
    console.error('Test history error:', error);
    return new Response(JSON.stringify({ error: 'Geçmiş yüklenemedi.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
