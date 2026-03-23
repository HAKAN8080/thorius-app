import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  try {
    const snap = await getDb()
      .collection('sessions')
      .where('userId', '==', user.id)
      .limit(50)
      .get();

    const sessions = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as { id: string; createdAt: string;[key: string]: unknown }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({ sessions });
  } catch (err) {
    console.error('Sessions GET error:', err);
    return Response.json({ sessions: [], error: String(err) });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { mentorId, mentorName, mentorTitle, messages, agenda } = await req.json();

  // Konuşma metnini oluştur
  const conversation = messages
    .filter((m: { role: string; text: string }) => m.text?.trim())
    .map((m: { role: string; text: string }) =>
      `${m.role === 'user' ? 'Kullanıcı' : 'Koç/Mentor'}: ${m.text}`
    )
    .join('\n\n');

  // Claude ile özet + ödev üret
  let summary = '';
  let homeworkItems: string[] = [];

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: `Aşağıdaki koçluk/mentorluk görüşmesini analiz et. Türkçe olarak SADECE JSON formatında yanıtla, başka hiçbir şey yazma:

{"summary":"2-3 cümlelik özet","homework":["ödev 1","ödev 2"]}

Kurallar:
- summary: görüşmede ne konuşuldu, ne üzerinde çalışıldı (2-3 cümle)
- homework: kişinin taahhüt ettiği veya yapması gereken 2-4 somut, uygulanabilir eylem adımı
- Eğer net eylem adımı yoksa genel gelişim önerileri yaz

Görüşme:
${conversation}`,
      maxOutputTokens: 400,
    });

    // Markdown code block varsa temizle
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const json = JSON.parse(cleaned);
    summary = json.summary ?? '';
    homeworkItems = json.homework ?? [];
  } catch {
    summary = 'Seans tamamlandı.';
    homeworkItems = [];
  }

  const homework = homeworkItems.map((text: string, i: number) => ({
    id: `hw_${i}`,
    text,
    completed: false,
  }));

  const sessionDoc = {
    userId: user.id,
    mentorId,
    mentorName,
    mentorTitle,
    createdAt: new Date().toISOString(),
    summary,
    homework,
    messageCount: messages.length,
    ...(agenda ? { agenda } : {}),
  };

  const ref = await getDb().collection('sessions').add(sessionDoc);
  return Response.json({ id: ref.id, ...sessionDoc });
}
