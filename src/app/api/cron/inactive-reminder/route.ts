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

  // 10 gun once
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  // Son 10 gunde giris yapmamis ve hatilatma gonderilmemis kullanicilari bul
  const usersSnap = await db.collection('users')
    .where('lastLoginAt', '<=', tenDaysAgo.toISOString())
    .where('inactiveReminderSent', '!=', true)
    .get();

  let sent = 0;

  for (const doc of usersSnap.docs) {
    const user = doc.data();

    // Email dogrulanmamis veya plan olmayan kullanicilara gonderme
    if (!user.emailVerified || !user.plan) continue;

    const lastLogin = new Date(user.lastLoginAt);
    const daysSince = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Kendine Zaman Ayir</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${user.name}</strong>,</p>

            <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.7;">
              Seni ${daysSince} gundur goremedik. Umariz her sey yolundadir. 🌱
            </p>

            <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.7;">
              Yogun gunlerde bile kendine kucuk anlar ayirmak, uzun vadede buyuk farklar yaratir.
              Belki bugun sadece 5 dakikalik bir nefes molasi veya kisa bir seans?
            </p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
                💡 <strong>Hatirlatma:</strong> Kisisel gelisim bir maraton, sprint degil.
                Her kucuk adim seni ileriye tasir.
              </p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:14px;font-weight:600;">
                  Kocunla Konus →
                </a>
              </td></tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
              Seni burada gormek guzel. Hazir oldugunda bekliyoruz. ✨
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © 2025 Thorius · <a href="mailto:destek@thorius.com.tr" style="color:#6366f1;text-decoration:none;">destek@thorius.com.tr</a>
            </p>
            <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;">
              Bu email ${daysSince} gundur giris yapmadiginiz icin gonderildi.
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
        to: user.email,
        subject: `Kendine biraz zaman ayir 🌱`,
        html,
      });

      // Hatirlatma gonderildi olarak isaretle
      await doc.ref.update({ inactiveReminderSent: true });
      sent++;
      console.log(`[Inactive Reminder] Sent to ${user.email} (${daysSince} days)`);
    } catch (err) {
      console.error(`[Inactive Reminder] Failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent });
}
