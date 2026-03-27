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
    severe: 'Yüksek Erteleme',
    moderate: 'Orta Erteleme',
    mild: 'Hafif Erteleme',
    low: 'Düşük Erteleme',
  };

  const prompt = `Sen bir davranışsal değişim ve verimlilik uzmanısın. Piers Steel'in Temporal Motivation Theory'sine dayanan erteleme testi sonuçlarını analiz et ve KİŞİSELLEŞTİRİLMİŞ AKSİYON PLANI oluştur.

**Test Sonuçları:**
- Başlama Direnci: ${scores.starting}%
- Mükemmeliyetçilik: ${scores.perfectionism}%
- Kaçınma Davranışı: ${scores.avoidance}%
- Zaman Yönetimi: ${100 - scores.time}% (düşük = iyi)
- Genel Erteleme Seviyesi: ${levelLabels[level]} (${scores.overall}%)

**Analiz İstekleri:**
1. Bu kişinin erteleme profilini 2-3 cümleyle özetle
2. EN YÜKSEK skorlu faktör için özel stratejiler sun (en kritik alan)
3. 3 somut, UYGULANABİLİR günlük aksiyon adımı ver:
   - "2 Dakika Kuralı" gibi spesifik teknikler öner
   - Pomodoro, time-blocking gibi kanıtlanmış yöntemler sun
4. Bir haftalık başlangıç planı oluştur (Pazartesi'den başla)
5. Motivasyonel bir kapanış cümlesi

Yanıtını Türkçe, somut ve uygulanabilir şekilde yaz. Soyut tavsiyeler yerine "YARIN SABAH bunu yap" gibi net yönergeler ver.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      maxOutputTokens: 800,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error('Procrastination report error:', error);
    return Response.json({ error: 'Analiz oluşturulamadı' }, { status: 500 });
  }
}
