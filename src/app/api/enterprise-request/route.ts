import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`enterprise-request:${ip}`, 10, 60); // saatte 10 istek
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { name, email, company, sessions, description } = await req.json();

  // Debug log
  console.log('[Enterprise Request] Received:', { name, email, company, sessions, description });

  // Validasyon
  if (!name || !email || !sessions || !description) {
    return NextResponse.json({ error: 'Zorunlu alanları doldurun.' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);

  const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Kurumsal Plan Talebi</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <div style="background:#dbeafe;border-left:4px solid #3b82f6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;">📧 Müşteri İletişim Bilgileri</p>
              <p style="margin:0 0 4px;color:#1e3a8a;font-size:16px;font-weight:700;">${name}</p>
              <p style="margin:0;color:#1e40af;font-size:14px;">
                <a href="mailto:${email}" style="color:#1e40af;text-decoration:underline;">${email}</a>
              </p>
            </div>

            <p style="margin:0 0 20px;color:#374151;font-size:15px;font-weight:600;">Talep Detayları:</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Ad Soyad</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${name}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f9fafb;border-radius:8px;margin-top:8px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">E-posta</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">
                    <a href="mailto:${email}" style="color:#111827;text-decoration:none;">${email}</a>
                  </p>
                </td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding:12px;background:#f9fafb;border-radius:8px;margin-top:8px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Şirket</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${company}</p>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:12px;background:#f9fafb;border-radius:8px;margin-top:8px;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Planlanan Seans Sayısı</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${sessions} seans</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f9fafb;border-radius:8px;margin-top:8px;">
                  <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">İhtiyaç Açıklaması</p>
                  <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">${description}</p>
                </td>
              </tr>
            </table>

            <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:10px;padding:16px 20px;">
              <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6;">
                💼 Bu talebe en kısa sürede dönüş yapınız. Müşteri ile iletişime geçmek için yukarıdaki e-posta adresini kullanabilirsiniz.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Thorius · Kurumsal Plan Sistemi</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    // Admin'e mail gönder
    console.log('[Enterprise Request] Sending admin email to: mhakan_ugur@yahoo.com');
    const adminResult = await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: 'mhakan_ugur@yahoo.com',
      subject: `Kurumsal Plan Talebi - ${name}`,
      html,
      replyTo: email, // Müşteri doğrudan yanıt verebilir
    });
    console.log('[Enterprise Request] Admin email sent:', adminResult);

    // Müşteriye onay maili gönder
    console.log('[Enterprise Request] Sending customer email to:', email);
    const customerHtml = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Kurumsal Plan</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              Kurumsal plan talebinizi aldık. Ekibimiz en kısa sürede size dönüş yapacaktır.
            </p>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:600;">Talep Özeti</p>
              <p style="margin:0;color:#166534;font-size:13px;line-height:1.6;">
                • Planlanan seans sayısı: <strong>${sessions}</strong><br/>
                ${company ? `• Şirket: <strong>${company}</strong><br/>` : ''}
                • İletişim: <strong>${email}</strong>
              </p>
            </div>

            <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
              Herhangi bir sorunuz varsa, lütfen <a href="mailto:mhakan_ugur@yahoo.com" style="color:#10b981;text-decoration:none;">mhakan_ugur@yahoo.com</a> adresinden bizimle iletişime geçin.
            </p>

            <p style="margin:0;color:#6b7280;font-size:14px;">
              Teşekkür ederiz,<br/>
              <strong style="color:#374151;">Thorius Ekibi</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Thorius · <a href="mailto:mhakan_ugur@yahoo.com" style="color:#10b981;text-decoration:none;">mhakan_ugur@yahoo.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const customerResult = await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: email,
      subject: 'Kurumsal Plan Talebiniz Alındı - Thorius',
      html: customerHtml,
    });
    console.log('[Enterprise Request] Customer email sent:', customerResult);
    console.log('[Enterprise Request] All emails sent successfully!');

  } catch (err) {
    console.error('[Enterprise Request] Email send failed:', err);
    return NextResponse.json({ error: 'E-posta gönderilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
  }

  console.log('[Enterprise Request] Request completed successfully');
  return NextResponse.json({ success: true });
}
