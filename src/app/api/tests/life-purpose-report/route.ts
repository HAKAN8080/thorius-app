import { getCurrentUser } from '@/lib/auth';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { scores, level } = await req.json();

  const levelLabels: Record<string, string> = {
    high: 'Güçlü Yaşam Amacı',
    moderate: 'Gelişen Amaç',
    searching: 'Arayış İçinde',
    low: 'Yön Arayışı',
  };

  const prompt = `Sen Viktor Frankl'ın logotherapy yaklaşımına hakim bir yaşam koçusun. Yaşam amacı testi sonuçlarını analiz et ve KİŞİSELLEŞTİRİLMİŞ YÖN HARİTASI oluştur.

**Test Sonuçları:**
- Anlam Duygusu: ${scores.meaning}%
- Hayat Yönü: ${scores.direction}%
- İçsel Motivasyon: ${scores.motivation}%
- Bağlantı & Katkı: ${scores.connection}%
- Genel Profil: ${levelLabels[level]} (${scores.overall}%)

**Analiz İstekleri:**
1. Bu kişinin anlam profilini 2-3 cümleyle özetle (Frankl'ın perspektifinden)
2. EN DÜŞÜK skorlu boyut için derinleştirici sorular sor (keşif için)
3. EN YÜKSEK skorlu boyutu nasıl leverage edebileceğini açıkla
4. 3 somut "ANLAM BULMA" egzersizi öner:
   - Değerler keşfi
   - İkigai haritalama
   - Miras vizyonu gibi pratikler
5. Viktor Frankl'dan ilham verici bir alıntı ile bitir

Yanıtını Türkçe, derin ama pratik yaz. Felsefi ama uygulanabilir olsun. Kişiyi düşündür ama somut adımlar da ver.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      maxOutputTokens: 800,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error('Life purpose report error:', error);
    return Response.json({ error: 'Analiz oluşturulamadı' }, { status: 500 });
  }
}
