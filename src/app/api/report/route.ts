import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const snap = await getDb()
    .collection('sessions')
    .where('userId', '==', user.id)
    .limit(50)
    .get();

  const allSessions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as {
    id: string;
    mentorTitle: string;
    createdAt: string;
    summary: string;
    status?: string;
    homework: { id: string; text: string; completed: boolean }[] | undefined;
  }[];

  // Sadece tamamlanmış seansları raporda kullan
  const sessions = allSessions.filter((s) => s.status === 'completed' || s.summary);

  if (sessions.length === 0) {
    return Response.json({ report: null, message: 'Henüz tamamlanmış seans bulunmuyor.' });
  }

  const totalHomework = sessions.reduce((acc, s) => acc + (s.homework?.length ?? 0), 0);
  const completedHomework = sessions.reduce((acc, s) => acc + (s.homework?.filter((h) => h.completed).length ?? 0), 0);

  const sessionsSummary = sessions
    .map((s, i) => {
      const hw = (s.homework ?? []).map((h) => `  - [${h.completed ? 'x' : ' '}] ${h.text}`).join('\n');
      return `Seans ${i + 1} (${s.mentorTitle}, ${new Date(s.createdAt).toLocaleDateString('tr-TR')}):
Özet: ${s.summary || 'Özet yok'}
Ödevler:\n${hw || '  - Yok'}`;
    })
    .join('\n\n');

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: `Aşağıdaki koçluk/mentorluk seans verileri bir kullanıcıya aittir. Türkçe olarak SADECE JSON formatında kişisel gelişim raporu oluştur:

{
  "overallSummary": "Kullanıcının genel gelişim yolculuğunu 2-3 cümleyle anlat",
  "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "growthAreas": ["gelişim alanı 1", "gelişim alanı 2", "gelişim alanı 3"],
  "homeworkCompletionRate": ${totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0},
  "patterns": "Görüşmelerde öne çıkan tekrarlayan temalar veya kalıplar hakkında 1-2 cümle",
  "nextSteps": ["öneri 1", "öneri 2", "öneri 3"]
}

İstatistikler: ${sessions.length} seans, ${totalHomework} ödev (${completedHomework} tamamlandı)

Seans Verileri:
${sessionsSummary}`,
      maxOutputTokens: 600,
    });

    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const report = JSON.parse(cleaned);
    report.totalSessions = sessions.length;
    report.totalHomework = totalHomework;
    report.completedHomework = completedHomework;
    report.generatedAt = new Date().toISOString();

    return Response.json({ report });
  } catch {
    return Response.json({ report: null, message: 'Rapor oluşturulamadı.' }, { status: 500 });
  }
}
