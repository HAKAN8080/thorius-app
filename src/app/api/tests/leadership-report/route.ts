import { getCurrentUser } from '@/lib/auth';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const LEADERSHIP_STYLES = {
  transformational: {
    name: 'Dönüşümcü Liderlik',
    description: 'İlham verme, motive etme ve ekip üyelerini dönüştürme odaklı',
    theory: 'Bass & Avolio (1994) - Multifactor Leadership Questionnaire',
  },
  transactional: {
    name: 'İşlemci Liderlik',
    description: 'Hedef odaklı, ödül-performans temelli yönetim',
    theory: 'Bass (1985), Burns (1978)',
  },
  servant: {
    name: 'Hizmetkar Liderlik',
    description: 'Ekibe hizmet etme ve gelişimlerini önceleme odaklı',
    theory: 'Greenleaf (1970), Spears (1995)',
  },
  visionary: {
    name: 'Vizyoner Liderlik',
    description: 'Geleceği görme, vizyon oluşturma ve yön belirleme odaklı',
    theory: 'Sashkin (1988), Nanus (1992)',
  },
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 });
  }

  const { scores, dominantStyle } = await req.json();

  const dominantInfo = LEADERSHIP_STYLES[dominantStyle as keyof typeof LEADERSHIP_STYLES];

  // Skorları formatla
  const scoreText = Object.entries(scores)
    .filter(([key]) => key !== 'dominant')
    .map(([key, value]) => {
      const style = LEADERSHIP_STYLES[key as keyof typeof LEADERSHIP_STYLES];
      return `- ${style?.name || key}: ${value}%`;
    })
    .join('\n');

  const prompt = `Sen bir liderlik geliştirme uzmanısın. Aşağıdaki liderlik testi sonuçlarını analiz et ve kişiye özel gelişim önerileri sun.

**Test Sonuçları:**
${scoreText}

**Dominant Liderlik Tarzı:** ${dominantInfo.name}
${dominantInfo.description}
Akademik Temel: ${dominantInfo.theory}

**Analiz İstekleri:**
1. Bu kişinin liderlik profilini 2-3 cümleyle özetle
2. Dominant tarzının iş hayatındaki avantajlarını belirt
3. İkincil güçlü tarzını ve bunun dominant tarzla nasıl dengeleneceğini açıkla
4. Düşük skorlu alanlarda gelişim için 2-3 somut öneri ver
5. Bu liderlik profili için uygun kariyer/rol önerileri sun

Yanıtını Türkçe, sıcak ve destekleyici bir dille yaz. Akademik terimler kullandığında kısa açıklamalar ekle.`;

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      maxOutputTokens: 800,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error('Leadership report error:', error);
    return Response.json({ error: 'Analiz oluşturulamadı' }, { status: 500 });
  }
}
