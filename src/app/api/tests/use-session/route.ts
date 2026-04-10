import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
import { getDb } from '@/lib/db';

const FREE_SESSION_LIMIT = 1;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { testType, testName, scores, duration } = await req.json();

  if (!testType || !testName) {
    return new Response(JSON.stringify({ error: 'Geçersiz test bilgisi.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Önce ücretsiz test hakkını kontrol et
  const freeTestsRemaining = user.freeTestsRemaining ?? 0;
  const usingFreeTest = freeTestsRemaining > 0;

  // Eğer ücretsiz test hakkı yoksa, seans limitini kontrol et
  if (!usingFreeTest) {
    const plan = user.plan ?? null;
    const sessionLimit = user.sessionLimit ?? (plan ? PLAN_LIMITS[plan] : FREE_SESSION_LIMIT);

    const snap = await getDb()
      .collection('sessions')
      .where('userId', '==', user.id)
      .get();

    // Sadece TAMAMLANMIŞ seansları say (aktif seanslar hariç)
    const completedCount = snap.docs.filter(d => {
      const status = d.data().status;
      return status === 'completed' || !status;
    }).length;

    if (completedCount >= sessionLimit) {
      return new Response(
        JSON.stringify({
          error: 'SESSION_LIMIT_REACHED',
          plan: plan ?? 'free',
          sessionCount: completedCount,
          sessionLimit,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Test seansı oluştur
  const sessionDoc = {
    userId: user.id,
    type: 'personality-test',
    testType,
    testName,
    scores: scores || {},
    duration: duration || 0,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
    summary: `${testName} tamamlandı.`,
    homework: [
      { id: 'hw_1', text: 'AI raporunu detaylıca incele ve notlar al.', completed: false },
      { id: 'hw_2', text: 'Güçlü yönlerini günlük hayatta nasıl kullanabileceğini düşün.', completed: false },
      { id: 'hw_3', text: 'Gelişim alanlarından birini seç ve bu hafta üzerinde çalış.', completed: false },
    ],
  };

  try {
    const ref = await getDb().collection('sessions').add(sessionDoc);

    // Eğer ücretsiz test hakkı kullanıldıysa, hakkı azalt
    if (usingFreeTest) {
      await getDb().collection('users').doc(user.id).update({
        freeTestsRemaining: freeTestsRemaining - 1,
      });
    }

    return Response.json({
      success: true,
      sessionId: ref.id,
      usedFreeTest: usingFreeTest,
      freeTestsRemaining: usingFreeTest ? freeTestsRemaining - 1 : 0,
    });
  } catch (error) {
    console.error('Test session create error:', error);
    return new Response(JSON.stringify({ error: 'Seans oluşturulamadı.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
