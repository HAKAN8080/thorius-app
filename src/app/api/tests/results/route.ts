import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

const TEST_NAMES: Record<string, string> = {
  'big-five': 'Kişilik Analizi (Big Five)',
  'personality': 'Kişilik Analizi (Big Five)',
  'eq-i': 'Duygusal Zeka (EQ-i)',
  'emotional-intelligence': 'Duygusal Zeka (EQ-i)',
  'life-score': 'Hayat Skoru',
  'leadership': 'Liderlik Tarzı',
  'procrastination': 'Erteleme Analizi',
  'life-purpose': 'Yaşam Amacı',
};

const TEST_ICONS: Record<string, string> = {
  'big-five': '🧠',
  'personality': '🧠',
  'eq-i': '💚',
  'emotional-intelligence': '💚',
  'life-score': '⭐',
  'leadership': '👑',
  'procrastination': '⏰',
  'life-purpose': '🧭',
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Sessions collection'dan test sonuçlarını çek
    const sessionsSnap = await getDb()
      .collection('sessions')
      .where('userId', '==', user.id)
      .where('type', '==', 'personality-test')
      .get();

    const testResults = sessionsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        testType: data.testType,
        testName: TEST_NAMES[data.testType] || data.testName || 'Test',
        icon: TEST_ICONS[data.testType] || '📊',
        scores: data.scores || {},
        overallScore: data.scores?.overall || null,
        createdAt: data.createdAt,
        duration: data.duration || 0,
      };
    });

    // Tarihe göre sırala (en yeni en üstte)
    testResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({ tests: testResults });
  } catch (error) {
    console.error('Test results fetch error:', error);
    return new Response(JSON.stringify({ error: 'Test sonuçları alınamadı.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
