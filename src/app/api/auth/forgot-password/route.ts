import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';
import { getUserByEmail } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`forgot-password:${ip}`, 5, 60); // saatte 5 istek
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'E-posta adresi gereklidir.' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);

  // Güvenlik için kullanıcı yoksa bile başarılı mesajı döndür
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Reset token oluştur (32 byte = 64 hex karakter)
  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 saat

  // Token'ı kaydet
  await getDb().collection('password_resets').doc(normalizedEmail).set({
    token: resetToken,
    expiry: resetTokenExpiry,
    createdAt: new Date().toISOString(),
  });

  // Email gönder
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://coaching.thorius.com.tr'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Şifre Sıfırlama</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${user.name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              Şifrenizi sıfırlamak için bir istek aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
                  Şifremi Sıfırla
                </a>
              </td></tr>
            </table>

            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
                ⚠️ Bu link <strong>1 saat</strong> içinde geçerliliğini yitirecektir. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
              </p>
            </div>

            <p style="margin:0;color:#9ca3af;font-size:12px;">
              Link çalışmıyorsa, bu adresi tarayıcınıza yapıştırın:<br/>
              <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
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
      to: normalizedEmail,
      subject: 'Şifre Sıfırlama Talebi - Thorius',
      html,
    });
  } catch (err) {
    console.error('[Forgot Password] Email send failed:', err);
    return NextResponse.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
