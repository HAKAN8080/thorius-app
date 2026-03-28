import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';

export const maxDuration = 30;

const ALERT_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@thorius.com.tr';
const ELEVENLABS_LOW_THRESHOLD = 0.20; // %20 altında uyar
const ANTHROPIC_DAILY_SPEND_LIMIT = parseFloat(process.env.ANTHROPIC_DAILY_LIMIT ?? '10'); // $10/gün varsayılan

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const alerts: string[] = [];

  // ── 1. ElevenLabs Quota Kontrolü ────────────────────────────────
  try {
    const elRes = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' },
    });

    if (elRes.ok) {
      const elData = await elRes.json() as {
        subscription: {
          character_count: number;
          character_limit: number;
          status: string;
        };
      };

      const used = elData.subscription.character_count;
      const limit = elData.subscription.character_limit;
      const remaining = limit - used;
      const pct = remaining / limit;

      if (pct <= ELEVENLABS_LOW_THRESHOLD) {
        alerts.push(`
          <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin-bottom:12px;">
            <p style="margin:0;font-weight:600;color:#dc2626;">🎙️ ElevenLabs Karakter Kotası Düşük</p>
            <p style="margin:8px 0 0;color:#374151;">
              Kullanılan: <strong>${used.toLocaleString('tr-TR')}</strong> / ${limit.toLocaleString('tr-TR')} karakter<br/>
              Kalan: <strong style="color:#dc2626;">${remaining.toLocaleString('tr-TR')} karakter (%${Math.round(pct * 100)})</strong>
            </p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
              Planı yükseltmek için: <a href="https://elevenlabs.io/app/subscription">elevenlabs.io</a>
            </p>
          </div>
        `);
      }
    }
  } catch (err) {
    console.error('[Monitor] ElevenLabs check failed:', err);
  }

  // ── 2. Anthropic Günlük Harcama Tahmini ─────────────────────────
  // Gerçek API kredisi sorgulanamıyor — bugünkü seans sayısından tahmin ediyoruz
  // Ortalama seans maliyeti ~$0.20 (Sonnet, 10 mesaj, ~3k token output)
  try {
    const db = getDb();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = await db
      .collection('sessions')
      .where('createdAt', '>=', todayStart.toISOString())
      .get();

    const sessionCount = todaySessions.size;
    const estimatedSpend = sessionCount * 0.20; // $0.20/seans (Sonnet tahmini)

    if (estimatedSpend >= ANTHROPIC_DAILY_SPEND_LIMIT * 0.8) {
      alerts.push(`
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:12px;">
          <p style="margin:0;font-weight:600;color:#d97706;">🤖 Anthropic Günlük Harcama Uyarısı</p>
          <p style="margin:8px 0 0;color:#374151;">
            Bugün: <strong>${sessionCount} seans</strong><br/>
            Tahmini harcama: <strong style="color:#d97706;">~$${estimatedSpend.toFixed(2)}</strong>
            (günlük limit: $${ANTHROPIC_DAILY_SPEND_LIMIT})<br/>
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
            Gerçek kullanımı kontrol et: <a href="https://console.anthropic.com/settings/usage">console.anthropic.com</a>
          </p>
        </div>
      `);
    }
  } catch (err) {
    console.error('[Monitor] Anthropic spend check failed:', err);
  }

  // ── 3. Uyarı varsa mail gönder ───────────────────────────────────
  if (alerts.length > 0) {
    try {
      await resend.emails.send({
        from: 'Thorius Sistem <noreply@thorius.com.tr>',
        to: ALERT_EMAIL,
        subject: `⚠️ Thorius API Uyarısı — ${new Date().toLocaleDateString('tr-TR')}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:12px;padding:20px;margin-bottom:24px;">
              <h1 style="margin:0;color:white;font-size:20px;">Thorius — API Uyarısı</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                ${new Date().toLocaleString('tr-TR')}
              </p>
            </div>

            ${alerts.join('')}

            <p style="font-size:12px;color:#9ca3af;margin-top:20px;">
              Bu mail Thorius otomatik izleme sistemi tarafından gönderilmiştir.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error('[Monitor] Alert email failed:', err);
    }
  }

  return NextResponse.json({
    ok: true,
    alertCount: alerts.length,
    checkedAt: new Date().toISOString(),
  });
}
