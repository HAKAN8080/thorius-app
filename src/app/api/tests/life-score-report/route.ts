import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { getCurrentUser } from '@/lib/auth';

export const maxDuration = 60;

const CATEGORY_NAMES: Record<string, string> = {
  happiness: 'Mutluluk & Pozitif Duygular',
  meaning: 'Anlam & Amaç',
  achievement: 'Başarı & Kariyer',
  relationships: 'İlişkiler & Sosyal Bağ',
  health: 'Sağlık & Enerji',
  finance: 'Finansal Güvenlik',
  growth: 'Kişisel Gelişim',
  balance: 'Yaşam Dengesi',
  overall: 'Genel Hayat Skoru',
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

  // En yüksek ve düşük alanları bul
  const sortedAreas = Object.entries(scores)
    .filter(([key]) => key !== 'overall')
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  const topAreas = sortedAreas.slice(0, 3).map(([key]) => CATEGORY_NAMES[key]).join(', ');
  const lowAreas = sortedAreas.slice(-3).map(([key]) => CATEGORY_NAMES[key]).join(', ');

  // Hayat seviyesini belirle
  const overallScore = scores['overall'] || 0;
  let lifeLevel = 'İyi';
  if (overallScore >= 85) lifeLevel = 'Olağanüstü';
  else if (overallScore >= 70) lifeLevel = 'Çok İyi';
  else if (overallScore >= 55) lifeLevel = 'İyi';
  else if (overallScore >= 40) lifeLevel = 'Gelişim Aşamasında';
  else lifeLevel = 'Başlangıç';

  const systemPrompt = `Sen deneyimli bir hayat koçu ve pozitif psikoloji uzmanısın. PERMA modeli (Seligman), Psikolojik İyi Oluş (Ryff) ve Yaşam Dengesi konularında uzmansın. Thorius platformunda kullanıcılara hayat koçluğu yapıyorsun.

Kullanıcının "Thorius Hayat Skoru Testi" sonuçlarını analiz edecek ve kişiselleştirilmiş bir gelişim planı oluşturacaksın.

SKORLAR (0-100 ölçeği):
${scoresSummary}

ANALİZ:
- Genel Hayat Skoru: %${overallScore} (${lifeLevel})
- En Güçlü Alanlar: ${topAreas}
- Gelişim Önceliği: ${lowAreas}

Yanıtını MUTLAKA aşağıdaki JSON formatında ver (başka hiçbir şey ekleme):

{
  "summary": "2-3 cümlelik kişiselleştirilmiş genel değerlendirme. Güçlü yönleri vurgula, umut ver.",
  "lifeLevel": "${lifeLevel}",
  "topStrengths": ["Güçlü yön 1 - neden önemli ve nasıl kullanılabilir", "Güçlü yön 2", "Güçlü yön 3"],
  "priorityAreas": ["Öncelikli gelişim alanı 1 - neden önemli", "Öncelikli gelişim alanı 2", "Öncelikli gelişim alanı 3"],
  "quickWins": ["Bu hafta yapılabilecek kolay ve etkili aksiyon 1", "Kolay aksiyon 2", "Kolay aksiyon 3", "Kolay aksiyon 4"],
  "longTermGoals": ["90 günlük hedef 1", "90 günlük hedef 2", "90 günlük hedef 3"],
  "weeklyPlan": [
    {"day": "Pzt", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Sal", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Çar", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Per", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Cum", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Cmt", "focus": "Odak alanı", "action": "Somut aksiyon"},
    {"day": "Paz", "focus": "Odak alanı", "action": "Somut aksiyon"}
  ]
}

ÖNEMLİ:
- Yanıtını Türkçe yaz
- Sadece JSON döndür, açıklama ekleme
- Skorlara göre kişiselleştirilmiş, özgün ve uygulanabilir içerik üret
- Hayat koçluğu tonu kullan: motive edici, destekleyici, somut
- quickWins gerçekten bu hafta yapılabilecek kolay şeyler olsun
- weeklyPlan düşük skorlu alanlara odaklansın
- Her gün farklı bir alana odaklansın`;

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      prompt: 'Yukarıdaki Hayat Skoru sonuçlarına göre kişiselleştirilmiş hayat koçluğu raporu oluştur.',
      maxOutputTokens: 2000,
    });

    // JSON'u parse et
    let report;
    try {
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
