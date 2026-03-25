import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 60;

const CATEGORY_NAMES: Record<string, string> = {
  extraversion: 'Dışadönüklük',
  agreeableness: 'Uyumluluk',
  conscientiousness: 'Sorumluluk',
  neuroticism: 'Duygusal Denge',
  openness: 'Açıklık',
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

  const systemPrompt = `Sen deneyimli bir klinik psikolog ve kariyer danışmanısın. Big Five (Beş Faktör) kişilik modeli konusunda uzmansın. Costa & McCrae (1992) çerçevesinde kişilik analizi yapıyorsun.

Kullanıcının Big Five Kişilik Envanteri sonuçlarını analiz edecek ve kapsamlı bir rapor oluşturacaksın.

SKORLAR (0-100 ölçeği):
${scoresSummary}

NOT:
- Dışadönüklük: Yüksek = sosyal, enerjik; Düşük = içedönük, sakin
- Uyumluluk: Yüksek = işbirlikçi, güvenilir; Düşük = rekabetçi, şüpheci
- Sorumluluk: Yüksek = disiplinli, organize; Düşük = esnek, spontan
- Duygusal Denge: Yüksek = sakin, dirençli; Düşük = hassas, kaygılı
- Açıklık: Yüksek = yaratıcı, meraklı; Düşük = pratik, geleneksel

Yanıtını MUTLAKA aşağıdaki JSON formatında ver (başka hiçbir şey ekleme):

{
  "summary": "2-3 cümlelik genel değerlendirme. Kişinin en belirgin özelliklerini vurgula.",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3", "Güçlü yön 4"],
  "developmentAreas": ["Gelişim alanı 1", "Gelişim alanı 2", "Gelişim alanı 3"],
  "careerSuggestions": ["Kariyer önerisi 1", "Kariyer önerisi 2", "Kariyer önerisi 3", "Kariyer önerisi 4"],
  "relationshipTips": ["İlişki önerisi 1", "İlişki önerisi 2", "İlişki önerisi 3"],
  "developmentPlan": [
    {"area": "Gelişim alanı adı", "action": "Somut eylem adımı ve uygulama önerisi"},
    {"area": "Gelişim alanı adı", "action": "Somut eylem adımı ve uygulama önerisi"},
    {"area": "Gelişim alanı adı", "action": "Somut eylem adımı ve uygulama önerisi"}
  ]
}

ÖNEMLİ:
- Yanıtını Türkçe yaz
- Sadece JSON döndür, açıklama ekleme
- Skorlara göre kişiselleştirilmiş, özgün içerik üret
- Akademik ve bilimsel bir dil kullan ama anlaşılır ol
- Güçlü yönleri ve gelişim alanlarını dengeli sun`;

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      prompt: 'Yukarıdaki skorlara göre kişilik raporu oluştur.',
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
