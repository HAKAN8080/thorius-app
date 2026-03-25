import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 60;

const CATEGORY_NAMES: Record<string, string> = {
  'self-awareness': 'Öz Farkındalık',
  'self-management': 'Öz Yönetim',
  'social-awareness': 'Sosyal Farkındalık',
  'relationship-management': 'İlişki Yönetimi',
  'stress-management': 'Stres Yönetimi',
  'overall': 'Genel EQ',
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { scores } = await req.json();

  if (!scores || typeof scores !== 'object') {
    return new Response(JSON.stringify({ error: 'Geçersiz skorlar.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Skorları formatlı stringe çevir
  const scoresSummary = Object.entries(scores)
    .map(([key, value]) => `${CATEGORY_NAMES[key] || key}: %${value}`)
    .join('\n');

  // EQ seviyesini belirle
  const overallScore = scores['overall'] || 0;
  let eqLevel = 'Orta';
  if (overallScore >= 80) eqLevel = 'Çok Yüksek';
  else if (overallScore >= 65) eqLevel = 'Yüksek';
  else if (overallScore >= 50) eqLevel = 'Orta';
  else if (overallScore >= 35) eqLevel = 'Gelişmeye Açık';
  else eqLevel = 'Başlangıç';

  const systemPrompt = `Sen deneyimli bir örgütsel psikolog ve duygusal zeka uzmanısın. Bar-On EQ-i (Emotional Quotient Inventory) modeli konusunda uzmansın. İş dünyasında liderlik koçluğu ve EQ geliştirme programları yürütüyorsun.

Kullanıcının EQ-i (Duygusal Zeka Envanteri) sonuçlarını analiz edecek ve iş dünyasına yönelik kapsamlı bir rapor oluşturacaksın.

SKORLAR (0-100 ölçeği):
${scoresSummary}

5 ANA ALAN AÇIKLAMALARI:
1. Öz Farkındalık: Kendi duygularını tanıma, güçlü/zayıf yönlerin farkındalığı
2. Öz Yönetim: Duygu kontrolü, dürtü yönetimi, motivasyon, esneklik
3. Sosyal Farkındalık: Empati, başkalarının duygularını okuma, sosyal ipuçları
4. İlişki Yönetimi: İletişim, çatışma çözümü, işbirliği, etkileme
5. Stres Yönetimi: Baskı altında performans, kriz yönetimi, dayanıklılık

Yanıtını MUTLAKA aşağıdaki JSON formatında ver (başka hiçbir şey ekleme):

{
  "summary": "2-3 cümlelik genel EQ değerlendirmesi. İş dünyasındaki anlamına vurgu yap.",
  "eqLevel": "${eqLevel}",
  "strengths": ["EQ güçlü yönü 1 - iş hayatındaki faydası ile", "EQ güçlü yönü 2", "EQ güçlü yönü 3", "EQ güçlü yönü 4"],
  "developmentAreas": ["Gelişim alanı 1 - neden önemli", "Gelişim alanı 2", "Gelişim alanı 3"],
  "workplaceTips": ["İş yerinde EQ kullanım önerisi 1", "İş yerinde EQ kullanım önerisi 2", "İş yerinde EQ kullanım önerisi 3"],
  "leadershipTips": ["Liderlik geliştirme önerisi 1", "Liderlik geliştirme önerisi 2", "Liderlik geliştirme önerisi 3"],
  "developmentPlan": [
    {"area": "Öz Farkındalık veya ilgili alan", "action": "Somut, uygulanabilir aksiyon ve günlük pratik"},
    {"area": "İlişki Yönetimi veya ilgili alan", "action": "Somut aksiyon"},
    {"area": "Stres Yönetimi veya ilgili alan", "action": "Somut aksiyon"}
  ]
}

ÖNEMLİ:
- Yanıtını Türkçe yaz
- Sadece JSON döndür, açıklama ekleme
- Skorlara göre kişiselleştirilmiş, özgün içerik üret
- İş dünyası ve liderlik odaklı öneriler sun
- Bar-On modeline uygun akademik bir dil kullan ama anlaşılır ol
- Düşük alanlara özel gelişim önerileri ver`;

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      prompt: 'Yukarıdaki EQ skorlarına göre duygusal zeka raporu oluştur.',
      maxOutputTokens: 1500,
    });

    // JSON'u parse et
    let report;
    try {
      // JSON bloğunu bul
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON bulunamadı');
      }
    } catch {
      console.error('JSON parse hatası:', result.text);
      return new Response(JSON.stringify({ error: 'Rapor oluşturulamadı.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('AI rapor hatası:', err);
    return new Response(JSON.stringify({ error: 'AI rapor üretilemedi.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
