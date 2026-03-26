import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { Resend } from 'resend';

// Seans özet emaili gönder
async function sendSessionSummaryEmail(
  userEmail: string,
  userName: string,
  mentorTitle: string,
  agenda: string | null,
  summary: string,
  homework: Array<{ id: string; text: string; completed: boolean }>
) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const agendaHtml = agenda
    ? `<!-- Gündem -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:600;">🎯 SEANS GÜNDEMİ</p>
              <p style="margin:0;color:#1d4ed8;font-size:14px;line-height:1.6;">${agenda}</p>
            </div>`
    : '';

  const homeworkHtml = homework.length > 0
    ? homework.map((hw, i) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#6366f1;color:#fff;border-radius:50%;font-size:12px;font-weight:600;flex-shrink:0;">${i + 1}</span>
              <span style="color:#374151;font-size:14px;line-height:1.5;">${hw.text}</span>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding:16px;color:#6b7280;font-size:14px;">Bu seans için özel ödev belirlenmedi.</td></tr>';

  const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Seans Özeti</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 8px;color:#374151;font-size:16px;">Merhaba <strong>${userName}</strong> 👋</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
              ${dateStr} tarihli <strong>${mentorTitle}</strong> seansınız tamamlandı. İşte özet ve ödevleriniz:
            </p>

            ${agendaHtml}

            <!-- Özet -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#166534;font-size:13px;font-weight:600;">📋 SEANS ÖZETİ</p>
              <p style="margin:0;color:#15803d;font-size:14px;line-height:1.6;">${summary}</p>
            </div>

            <!-- Ödevler -->
            <div style="background:#fefce8;border:1px solid #fef08a;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <div style="background:#fef9c3;padding:14px 20px;border-bottom:1px solid #fef08a;">
                <p style="margin:0;color:#854d0e;font-size:13px;font-weight:600;">✅ ÖDEVLERİN</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${homeworkHtml}
              </table>
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/profile"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Ödevlerimi Görüntüle →
                </a>
              </td></tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Bir sonraki seansınızda görüşmek üzere! 🚀
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © 2025 Thorius · <a href="mailto:destek@thorius.com.tr" style="color:#6366f1;text-decoration:none;">destek@thorius.com.tr</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: userEmail,
      subject: `✅ Seans Tamamlandı — ${mentorTitle} · ${dateStr}`,
      html,
    });
    console.log(`[Session Email] Sent summary to ${userEmail}`);
  } catch (err) {
    console.error(`[Session Email] Failed for ${userEmail}:`, err);
  }
}

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

  const { sessionId, mentorId, mentorName, mentorTitle, messages, agenda } = await req.json();

  // Eğer sessionId varsa, mevcut seansı tamamla (güncelle)
  if (sessionId) {
    const sessionRef = getDb().collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists || sessionDoc.data()?.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Seans bulunamadı' }), { status: 404 });
    }

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

    await sessionRef.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      summary,
      homework,
      messageCount: messages.length,
      messages: messages.map((m: { role: string; text: string }) => ({ role: m.role, text: m.text })),
    });

    return Response.json({ id: sessionId, summary, homework });
  }

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
    status: 'completed',
    ...(agenda ? { agenda } : {}),
  };

  const ref = await getDb().collection('sessions').add(sessionDoc);

  // Seans özeti emaili gönder (arka planda, response'u bekletme)
  sendSessionSummaryEmail(
    user.email,
    user.name || user.email.split('@')[0],
    mentorTitle,
    agenda || null,
    summary,
    homework
  ).catch(err => console.error('[Session Email] Background error:', err));

  return Response.json({ id: ref.id, ...sessionDoc });
}
