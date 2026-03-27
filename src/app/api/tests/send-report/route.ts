import { getCurrentUser } from '@/lib/auth';
import { Resend } from 'resend';
import { pdf } from '@react-pdf/renderer';
import { TestReportPDF, type TestReportData } from '@/lib/pdf/test-report-template';

// Test tiplerine göre başlıklar
const TEST_TITLES: Record<string, string> = {
  personality: 'Big Five Kisilik Envanteri',
  'emotional-intelligence': 'Duygusal Zeka Envanteri (EQ-i)',
  'life-score': 'Thorius Hayat Skoru',
  leadership: 'Liderlik Tarzi Envanteri',
  procrastination: 'Erteleme Profili Testi',
  'life-purpose': 'Yasam Amaci & Yon Testi',
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    const body = await req.json();
    const { testType, scores, dimensions, analysis, strengths, developmentAreas, recommendations, overallScore, overallLabel, duration } = body;

    if (!testType || !scores) {
      return Response.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // PDF verisi hazırla
    const reportData: TestReportData = {
      testName: TEST_TITLES[testType] || 'Test Raporu',
      testType,
      userName: user.name || 'Kullanici',
      completedAt: new Date().toISOString(),
      duration,
      overallScore,
      overallLabel,
      dimensions: dimensions || Object.entries(scores).map(([id, score]) => ({
        id,
        name: id,
        score: score as number,
      })),
      analysis,
      strengths,
      developmentAreas,
      recommendations,
    };

    // PDF oluştur
    const pdfDoc = pdf(TestReportPDF({ data: reportData }));
    const pdfBlob = await pdfDoc.toBlob();
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Email HTML içeriği
    const emailHtml = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 48px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Thorius</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Test Raporunuz Hazir</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Merhaba <strong>${user.name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              <strong>${reportData.testName}</strong> test raporunuz hazir. PDF dosyasi olarak ekte bulabilirsiniz.
            </p>

            ${overallScore !== undefined ? `
            <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:13px;">${overallLabel || 'Genel Skor'}</p>
              <p style="margin:0;color:#ffffff;font-size:36px;font-weight:700;">%${overallScore}</p>
            </div>
            ` : ''}

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Boyut Skorlariniz</p>
              ${reportData.dimensions.slice(0, 5).map(dim => `
                <div style="margin-bottom:12px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:13px;color:#374151;">${dim.name}</span>
                    <span style="font-size:13px;font-weight:600;color:#6366f1;">%${dim.score}</span>
                  </div>
                  <div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;">
                    <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:100%;width:${dim.score}%;border-radius:4px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://coaching.thorius.com.tr/tests"
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Diger Testleri Kesfet →
                </a>
              </td></tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
              Gelisim yolculugunuzda size eslik etmekten mutluluk duyuyoruz! 🌟
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

    // Email gönder
    const { error } = await resend.emails.send({
      from: 'Thorius <destek@thorius.com.tr>',
      to: user.email,
      subject: `📊 ${reportData.testName} - Test Raporunuz`,
      html: emailHtml,
      attachments: [
        {
          filename: `thorius-${testType}-rapor-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Email gonderme hatasi:', error);
      return Response.json({ error: 'Email gonderilemedi' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Rapor emailinize gonderildi' });
  } catch (error) {
    console.error('Send report error:', error);
    return Response.json({ error: 'Bir hata olustu' }, { status: 500 });
  }
}
