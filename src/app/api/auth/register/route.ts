import { NextResponse, NextRequest } from 'next/server';
import { createUser, getUserByEmail, hashPassword, PlanType } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Resend } from 'resend';
import { randomBytes, createHash } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`register:${ip}`, 5, 60); // saatte 5 kayıt
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  const {
    name, email, password,
    agreedToTerms, agreedToPrivacy, agreedToCoachingService, agreedToAiDisclaimer,
    agreedToKvkk, agreedToConfidentiality,
    company, jobTitle, interests,
  } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Ad, e-posta ve şifre zorunludur.' }, { status: 400 });
  }

  if (!agreedToTerms || !agreedToPrivacy || !agreedToCoachingService || !agreedToAiDisclaimer || !agreedToKvkk || !agreedToConfidentiality) {
    return NextResponse.json({ error: 'Tüm sözleşmeleri onaylamanız gerekmektedir.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // Check if there's a pending plan from a prior WooCommerce purchase
  const normalizedEmail = email.toLowerCase().trim();
  const pendingDoc = await getDb().collection('pending_plans').doc(normalizedEmail).get();
  const pending = pendingDoc.exists ? (pendingDoc.data() as { plan: PlanType; activatedAt: string }) : null;

  const user = await createUser({
    email: normalizedEmail,
    name,
    passwordHash,
    agreedToTerms,
    agreedToPrivacy,
    agreedToKvkk,
    agreedToConfidentiality,
    agreedToCoachingService,
    agreedToAiDisclaimer,
    company: company ?? '',
    jobTitle: jobTitle ?? '',
    interests: interests ?? [],
    emailVerified: false,
    ...(pending ? { plan: pending.plan, planActivatedAt: pending.activatedAt } : {}),
  });

  // Remove the pending activation record if used
  if (pending) {
    await getDb().collection('pending_plans').doc(normalizedEmail).delete();
  }

  // Email doğrulama token'ı oluştur ve gönder
  const verifyToken = randomBytes(32).toString('hex');
  const verifyTokenHash = createHash('sha256').update(verifyToken).digest('hex');
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat

  await getDb().collection('email_verifications').doc(normalizedEmail).set({
    tokenHash: verifyTokenHash, // Hash olarak sakla (güvenlik için)
    expiry: verifyExpiry,
    userId: user.id,
    createdAt: new Date().toISOString(),
  });

  // Doğrulama emaili gönder
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://coaching.thorius.com.tr'}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(normalizedEmail)}`;

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
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Hoş Geldiniz!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              Thorius ailesine katıldığınız için teşekkür ederiz! Hesabınızı aktive etmek için aşağıdaki butona tıklayın.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
                  E-postamı Doğrula
                </a>
              </td></tr>
            </table>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
                ✨ Doğrulamadan sonra AI koç ve mentorlarımızla görüşmeye hemen başlayabilirsiniz!
              </p>
            </div>

            <p style="margin:0;color:#9ca3af;font-size:12px;">
              Bu link 24 saat geçerlidir. Link çalışmıyorsa, bu adresi tarayıcınıza yapıştırın:<br/>
              <a href="${verifyUrl}" style="color:#6366f1;word-break:break-all;">${verifyUrl}</a>
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
      subject: 'Hesabınızı Aktive Edin - Thorius',
      html,
    });
  } catch (err) {
    console.error('[Register] Verification email failed:', err);
    // Email gönderilemese bile kayıt başarılı sayılır
  }

  // Email doğrulama sayfasına yönlendir (token vermiyoruz - önce doğrulama gerekli)
  return NextResponse.json({
    success: true,
    requiresVerification: true,
    email: normalizedEmail,
  });
}
