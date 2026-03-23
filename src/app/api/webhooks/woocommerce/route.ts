import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';
import { PlanType } from '@/lib/auth';

const SKU_TO_PLAN: Record<string, PlanType> = {
  'THORIUS-ESSENTIAL': 'essential',
  'THORIUS-PREMIUM': 'premium',
};

const PLAN_LABELS: Partial<Record<PlanType, string>> = {
  essential: 'Essential',
  premium: 'Premium',
};

const PLAN_SESSIONS: Partial<Record<PlanType, string>> = {
  essential: '10 seans',
  premium: '25 seans',
};

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return expected === signature;
}

function buildEmailHtml(plan: PlanType, firstName: string): string {
  const label = PLAN_LABELS[plan] ?? plan;
  const sessions = PLAN_SESSIONS[plan] ?? '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thorius – Hoş Geldiniz</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Thorius</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">AI Koçluk & Mentorluk Platformu</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">Merhaba <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                <strong>${label} Plan</strong> satın alımınız başarıyla tamamlandı. Hesabınız aktive edildi, koçluk yolculuğunuza başlayabilirsiniz!
              </p>

              <!-- Plan Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Aktif Planınız</p>
                    <p style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:700;">${label} Plan</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:24px;">
                          <p style="margin:0;color:#6b7280;font-size:13px;">Seans Hakkı</p>
                          <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:600;">${sessions}</p>
                        </td>
                        <td>
                          <p style="margin:0;color:#6b7280;font-size:13px;">Durum</p>
                          <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#10b981;">✓ Aktif</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://coaching.thorius.com.tr/mentors"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
                      Koçlara Göz At →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
                Herhangi bir sorunuz için <a href="mailto:destek@thorius.com.tr" style="color:#6366f1;text-decoration:none;">destek@thorius.com.tr</a> adresine yazabilirsiniz.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 48px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Thorius · thorius.com.tr</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[WC Webhook] WOOCOMMERCE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-wc-webhook-signature');

  console.log('[WC Webhook] Received. Signature present:', !!signature, '| Sig value:', signature);

  // TODO: imza doğrulaması debug sonrası tekrar aktif edilecek
  // if (!verifySignature(rawBody, signature, webhookSecret)) {
  //   console.warn('[WC Webhook] Invalid signature');
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  let order: WooOrder;
  try {
    order = JSON.parse(rawBody) as WooOrder;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only process completed orders
  if (order.status !== 'completed') {
    return NextResponse.json({ received: true, skipped: 'not completed' });
  }

  const email = order.billing?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'No billing email' }, { status: 400 });
  }

  // Find which plan SKU was ordered
  let plan: PlanType | null = null;
  for (const item of order.line_items ?? []) {
    const sku = item.sku?.toUpperCase();
    if (sku && SKU_TO_PLAN[sku]) {
      plan = SKU_TO_PLAN[sku];
      break;
    }
  }

  if (!plan) {
    return NextResponse.json({ received: true, skipped: 'no matching SKU' });
  }

  const db = getDb();
  const firstName = order.billing?.first_name || 'Değerli Üye';

  // Kaç seans ekleneceğini belirle
  const SESSIONS_TO_ADD: Record<PlanType, number> = {
    essential: 10,
    premium: 20,
  };
  const sessionsToAdd = SESSIONS_TO_ADD[plan];

  // Find the user by email
  const snap = await db.collection('users').where('email', '==', email).limit(1).get();

  if (!snap.empty) {
    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    // Mevcut sessionLimit'i al, yoksa plan bazlı hesapla
    const currentLimit: number = userData.sessionLimit ?? (userData.plan === 'premium' ? 30 : userData.plan === 'essential' ? 10 : 0);
    const newLimit = currentLimit + sessionsToAdd;

    // Premium bir kez alındıysa kalıcı premium
    const newPlan: PlanType = plan === 'premium' || userData.isPremium ? 'premium' : plan;
    const isPremium = plan === 'premium' || userData.isPremium === true;

    await userDoc.ref.update({
      plan: newPlan,
      isPremium,
      sessionLimit: newLimit,
      planActivatedAt: new Date().toISOString(),
    });
    console.log(`[WC Webhook] +${sessionsToAdd} seans eklendi. Yeni limit: ${newLimit}. Plan: ${newPlan} — ${email}`);
  } else {
    await db.collection('pending_plans').doc(email).set({
      plan,
      sessionsToAdd,
      orderId: String(order.id),
      activatedAt: new Date().toISOString(),
    });
    console.log(`[WC Webhook] Pending plan '${plan}' stored for ${email}`);
  }

  // Send welcome email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Thorius <destek@thorius.com.tr>',
        to: email,
        subject: `${PLAN_LABELS[plan]} Planınız Aktive Edildi 🎉`,
        html: buildEmailHtml(plan, firstName),
      });
      console.log(`[WC Webhook] Welcome email sent to ${email}`);
    } catch (err) {
      console.error('[WC Webhook] Email send failed:', err);
    }
  }

  return NextResponse.json({ received: true, plan, email });
}

// ---  WooCommerce order shape (minimal) ---
interface WooOrder {
  id: number;
  status: string;
  billing: { email: string; first_name: string };
  line_items: Array<{ sku: string; name: string; quantity: number }>;
}
