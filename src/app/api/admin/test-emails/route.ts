import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const { secret, email } = await req.json();

  // Basit guvenlik kontrolu
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const results: { type: string; success: boolean; error?: string }[] = [];

  // 1. SEANS HATILATMA
  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: `📅 [TEST] Yarın seansınız var — Kariyer Koçu · 15 Ocak 14:00`,
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
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
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>Test Kullanıcı</strong> 👋</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>Yarın 15 Ocak</strong> saat <strong>14:00</strong> için planladığınız seans var. Hatırlatmak istedik! 📅
            </p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:24px;">
                    <p style="margin:0;color:#6b7280;font-size:13px;">Mentor / Koç</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">Kariyer Koçu</p>
                  </td>
                  <td>
                    <p style="margin:0;color:#6b7280;font-size:13px;">Saat</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">15 Ocak · 14:00</p>
                  </td>
                </tr>
              </table>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
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
</html>`,
    });
    results.push({ type: 'Seans Hatırlatma', success: true });
  } catch (e: any) {
    results.push({ type: 'Seans Hatırlatma', success: false, error: e.message });
  }

  // 2. ODEV HATILATMA
  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: `📋 [TEST] 2 ödeviniz sizi bekliyor`,
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
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
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>Test Kullanıcı</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>Kariyer Koçu</strong> seansınızın üzerinden 2 gün geçti. Ödevlerinizi tamamladınız mı? 🎯
            </p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Bekleyen Ödevleriniz</p>
              <ul style="margin:0;padding:0 0 0 16px;color:#111827;font-size:14px;line-height:1.7;">
                <li style="margin-bottom:8px;">1. Günlük 10 dakika meditasyon yap</li>
                <li style="margin-bottom:8px;">2. Haftalık hedeflerini belirle</li>
              </ul>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/profile" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
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
</html>`,
    });
    results.push({ type: 'Ödev Hatırlatma', success: true });
  } catch (e: any) {
    results.push({ type: 'Ödev Hatırlatma', success: false, error: e.message });
  }

  // 3. ILERLEME KONTROLU (7 gun seans yok)
  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: `[TEST] 7 gündür görüşmediniz — nasıl gidiyor? 🌱`,
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
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
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>Test Kullanıcı</strong>,</p>
            <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
              Son seansınızdan bu yana <strong>7 gün</strong> geçti. Nasıl gidiyor? 🌱
            </p>
            <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
              Gelişim yolculuğu tutarlılıkla güçlenir. Bir sonraki seansınızı planlamak için sadece birkaç dakikanız yeterli.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Son görüştüğünüz</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">Kariyer Koçu</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
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
</html>`,
    });
    results.push({ type: 'İlerleme Kontrolü (7 gün seans yok)', success: true });
  } catch (e: any) {
    results.push({ type: 'İlerleme Kontrolü', success: false, error: e.message });
  }

  // 4. 10 GUN GIRIS YOK
  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: `[TEST] Kendine biraz zaman ayır 🌱`,
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Kendine Zaman Ayır</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>Test Kullanıcı</strong>,</p>
            <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.7;">
              Seni 10 gündür göremedik. Umarız her şey yolundadır. 🌱
            </p>
            <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.7;">
              Yoğun günlerde bile kendine küçük anlar ayırmak, uzun vadede büyük farklar yaratır.
              Belki bugün sadece 5 dakikalık bir nefes molası veya kısa bir seans?
            </p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
              <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
                💡 <strong>Hatırlatma:</strong> Kişisel gelişim bir maraton, sprint değil.
                Her küçük adım seni ileriye taşır.
              </p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/mentors" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:14px;font-weight:600;">
                  Koçunla Konuş →
                </a>
              </td></tr>
            </table>
            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
              Seni burada görmek güzel. Hazır olduğunda bekliyoruz. ✨
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
</html>`,
    });
    results.push({ type: '10 Gün Giriş Yok', success: true });
  } catch (e: any) {
    results.push({ type: '10 Gün Giriş Yok', success: false, error: e.message });
  }

  // 5. TEST SONUCU RAPORU
  try {
    await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: `📊 [TEST] Big Five Kişilik Envanteri - Test Raporunuz`,
      html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Test Raporunuz Hazır</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>Test Kullanıcı</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>Big Five Kişilik Envanteri</strong> test raporunuz hazır. PDF dosyası olarak ekte bulabilirsiniz.
            </p>
            <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:13px;">Genel Skor</p>
              <p style="margin:0;color:#ffffff;font-size:36px;font-weight:700;">%72</p>
            </div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Boyut Skorlarınız</p>
              <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:13px;color:#374151;">Dışadönüklük</span>
                  <span style="font-size:13px;font-weight:600;color:#6366f1;">%68</span>
                </div>
                <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:100%;width:68%;border-radius:4px;"></div>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:13px;color:#374151;">Uyumluluk</span>
                  <span style="font-size:13px;font-weight:600;color:#6366f1;">%75</span>
                </div>
                <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:100%;width:75%;border-radius:4px;"></div>
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:13px;color:#374151;">Sorumluluk</span>
                  <span style="font-size:13px;font-weight:600;color:#6366f1;">%82</span>
                </div>
                <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
                  <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:100%;width:82%;border-radius:4px;"></div>
                </div>
              </div>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/tests" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Diğer Testleri Keşfet →
                </a>
              </td></tr>
            </table>
            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Gelişim yolculuğunuzda size eşlik etmekten mutluluk duyuyoruz! 🌟
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
</html>`,
    });
    results.push({ type: 'Test Sonucu Raporu', success: true });
  } catch (e: any) {
    results.push({ type: 'Test Sonucu Raporu', success: false, error: e.message });
  }

  return NextResponse.json({
    success: true,
    email,
    results,
    summary: `${results.filter(r => r.success).length}/${results.length} email gönderildi`
  });
}
