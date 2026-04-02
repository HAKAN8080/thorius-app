import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { sessionId, aiReport } = await req.json();

  if (!sessionId || !aiReport) {
    return new Response(JSON.stringify({ error: 'Geçersiz veri.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sessionRef = getDb().collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return new Response(JSON.stringify({ error: 'Seans bulunamadı.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Kullanıcının kendi seansı mı kontrol et
    if (sessionDoc.data()?.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Yetkisiz erişim.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI raporunu kaydet
    await sessionRef.update({
      aiReport,
      aiReportGeneratedAt: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Save report error:', error);
    return new Response(JSON.stringify({ error: 'Rapor kaydedilemedi.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
