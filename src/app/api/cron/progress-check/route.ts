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

  // 7 gün önce seans yapmış ama son 7 günde seans yapmamış kullanıcıları bul
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Son 14 gün içinde seans yapmış kullanıcıları bul
  const sessionsSnap = await db.collection('sessions')
    .where('createdAt', '>=', fourteenDaysAgo.toISOString())
    .get();

  // Kullanıcı başına son seans tarihini grupla
  const userLastSession: Record<string, { date: Date; mentorTitle: string; userId: string }> = {};
  for (const doc of sessionsSnap.docs) {
    const s = doc.data();
    const date = new Date(s.createdAt);
    if (!userLastSession[s.userId] || date > userLastSession[s.userId].date) {
      userLastSession[s.userId] = { date, mentorTitle: s.mentorTitle, userId: s.userId };
    }
  }

  let sent = 0;

  for (const [userId, info] of Object.entries(userLastSession)) {
    // Son seans 7 günden eski ise hatırlatma gönder
    if (info.date >= sevenDaysAgo) continue;

    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) continue;
    const user = userSnap.data()!;
    if (!user.plan) continue; // Free kullanıcılara gönderme

    const daysSince = Math.floor((Date.now() - info.date.getTime()) / (1000 * 60 * 60 * 24));

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">İlerleme Kontrolü</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${user.name}</strong>,</p>
            <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
              Son seansınızdan bu yana <strong>${daysSince} gün</strong> geçti. Nasıl gidiyor? 🌱
            </p>
            <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
              Gelişim yolculuğu tutarlılıkla güçlenir. Bir sonraki seansınızı planlamak için sadece birkaç dakikanız yeterli.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Son görüştüğünüz</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${info.mentorTitle}</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Seansa Devam Et →
                </a>
              </td></tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
              Hazır hissetmediğinizde bile küçük bir adım atmak yeterli. 🚀
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
        subject: `${daysSince} gündür görüşmediniz — nasıl gidiyor? 🌱`,
        html,
      });
      sent++;
      console.log(`[Progress Check] Sent to ${user.email}`);
    } catch (err) {
      console.error(`[Progress Check] Failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent });
}
