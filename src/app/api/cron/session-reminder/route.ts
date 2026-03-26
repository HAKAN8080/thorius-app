import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const db = getDb();

  // YARIN seans olanları bul (sabah 09:00'da çalışır, 1 gün önceden hatırlatma)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const snap = await db.collection('scheduled_sessions')
    .where('scheduledAt', '>=', tomorrowStart.toISOString())
    .where('scheduledAt', '<=', tomorrowEnd.toISOString())
    .where('reminderSent', '!=', true) // Daha önce gönderilmemişleri al
    .get();

  let sent = 0;

  for (const doc of snap.docs) {
    const session = doc.data();
    const scheduledDate = new Date(session.scheduledAt);

    const timeStr = scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = scheduledDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Seans Hatırlatması</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${session.userName}</strong> 👋</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>Yarın ${dateStr}</strong> saat <strong>${timeStr}</strong> için planladığınız seans var. Hatırlatmak istedik! 📅
            </p>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:24px;">
                    <p style="margin:0;color:#6b7280;font-size:13px;">Mentor / Koç</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">${session.mentorTitle}</p>
                  </td>
                  <td>
                    <p style="margin:0;color:#6b7280;font-size:13px;">Saat</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">${dateStr} · ${timeStr}</p>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">
                💡 <strong>Hatırlatma:</strong> Bu sadece yarınki seansınız için bir gün önceden hatırlatmadır.
                Planladığınız saatte giriş yaparak seansınıza başlayabilirsiniz.
                Gelişim yolculuğunuzda size eşlik etmekten mutluluk duyuyoruz!
              </p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Seansa Başla →
                </a>
              </td></tr>
            </table>
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
        to: session.userEmail,
        subject: `📅 Yarın seansınız var — ${session.mentorTitle} · ${dateStr} ${timeStr}`,
        html,
      });
      await doc.ref.update({ reminderSent: true });
      sent++;
      console.log(`[Session Reminder] Sent to ${session.userEmail}`);
    } catch (err) {
      console.error(`[Session Reminder] Failed for ${session.userEmail}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent });
}
