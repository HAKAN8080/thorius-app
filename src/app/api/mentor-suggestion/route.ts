import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { getCurrentUser } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thorius.com.tr';

export async function POST(req: NextRequest) {
  try {
    // Kullanıcı kontrolü
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Öneri göndermek için giriş yapmanız gerekmektedir.' },
        { status: 401 }
      );
    }

    const { type, field, description, userEmail, userName } = await req.json();

    if (!field || !field.trim()) {
      return NextResponse.json(
        { error: 'Uzmanlık alanı zorunludur.' },
        { status: 400 }
      );
    }

    const typeLabel = type === 'coach' ? 'AI Koç' : 'AI Mentor';

    // Admin'e mail gönder
    await resend.emails.send({
      from: 'Thorius <noreply@thorius.com.tr>',
      to: ADMIN_EMAIL,
      subject: `Yeni ${typeLabel} Önerisi - ${field}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Yeni Koç/Mentor Önerisi</h2>

          <div style="background: #f8f5ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Tür:</strong> ${typeLabel}</p>
            <p style="margin: 0 0 10px 0;"><strong>Uzmanlık Alanı:</strong> ${field}</p>
            ${description ? `<p style="margin: 0 0 10px 0;"><strong>Açıklama:</strong> ${description}</p>` : ''}
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280;"><strong>Gönderen:</strong></p>
            <p style="margin: 0 0 5px 0;">${userName || 'İsimsiz'}</p>
            <p style="margin: 0; color: #7c3aed;">${userEmail || user.email}</p>
          </div>

          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            Bu öneri Thorius platformu üzerinden gönderilmiştir.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mentor suggestion error:', error);
    return NextResponse.json(
      { error: 'Öneri gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
