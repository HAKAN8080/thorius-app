import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel cron doğrulama
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const db = getDb();

  // 2 gün önce oluşturulan seansları bul
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStart = new Date(twoDaysAgo);
  twoDaysAgoStart.setHours(0, 0, 0, 0);
  const twoDaysAgoEnd = new Date(twoDaysAgo);
  twoDaysAgoEnd.setHours(23, 59, 59, 999);

  const sessionsSnap = await db.collection('sessions')
    .where('createdAt', '>=', twoDaysAgoStart.toISOString())
    .where('createdAt', '<=', twoDaysAgoEnd.toISOString())
    .get();

  let sent = 0;

  for (const doc of sessionsSnap.docs) {
    const session = doc.data();

    // Tamamlanmamış ödev var mı?
    const pendingHw = (session.homework ?? []).filter((h: { completed: boolean }) => !h.completed);
    if (pendingHw.length === 0) continue;

    // Kullanıcıyı bul
    const userSnap = await db.collection('users').doc(session.userId).get();
    if (!userSnap.exists) continue;
    const user = userSnap.data()!;

    const homeworkList = pendingHw.map((h: { text: string }, i: number) =>
      `<li style="margin-bottom:8px;">${i + 1}. ${h.text}</li>`
    ).join('');

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Ödev Hatırlatması</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${user.name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>${session.mentorTitle}</strong> seansınızın üzerinden 2 gün geçti. Ödevlerinizi tamamladınız mı? 🎯
            </p>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Bekleyen Ödevleriniz</p>
              <ul style="margin:0;padding:0 0 0 16px;color:#111827;font-size:14px;line-height:1.7;">
                ${homeworkList}
              </ul>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/profile"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Ödevlerimi Gör →
                </a>
              </td></tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Küçük adımlar büyük değişimlere yol açar. Başarılar! 💪
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Thorius · <a href="mailto:destek@thorius.com.tr" style="color:#6366f1;text-decoration:none;">destek@thorius.com.tr</a></p>
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
        to: user.email,
        subject: `📋 ${pendingHw.length} ödeviniz sizi bekliyor`,
        html,
      });
      sent++;
      console.log(`[Homework Reminder] Sent to ${user.email}`);
    } catch (err) {
      console.error(`[Homework Reminder] Failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent });
}
