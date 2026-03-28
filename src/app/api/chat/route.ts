import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { DEFAULT_MENTORS, PREMIUM_MENTOR_IDS } from '@/lib/types';
import { getCurrentUser, PLAN_LIMITS, PREMIUM_ACCESS_PLANS } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getBookForMentor, getAllBooksForMentor, getThoughtLeaderForMentor, THOUGHT_LEADERS } from '@/lib/books';

export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Oturum açmanız gerekmektedir.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, mentorId, customSystemPrompt, isLastMessage: isLastMsg } = await req.json();

  // Kullanıcının seanslarını al
  const snap = await getDb().collection('sessions').where('userId', '==', user.id).get();

  // Kullanıcının test sonuçlarını al
  const testsSnap = await getDb().collection('tests').where('userId', '==', user.id).get();
  const userTests = testsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    testType: string;
    testName: string;
    scores: Record<string, number>;
    analysis?: string;
    createdAt: string;
  }>;

  // Bu mentor ile aktif seans var mı kontrol et
  const activeSession = snap.docs.find(d =>
    d.data().mentorId === mentorId && d.data().status === 'active'
  );

  // Aktif seans yoksa ve bu ilk mesaj değilse, limit kontrolü yap
  if (!activeSession) {
    const sessionLimit = user.sessionLimit ?? (user.plan ? PLAN_LIMITS[user.plan] : 1);
    // Tamamlanmış + aktif seansları say
    if (snap.size >= sessionLimit) {
      return new Response(
        JSON.stringify({ error: 'SESSION_LIMIT_REACHED', plan: user.plan ?? 'free' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Bu mentor ile önceki TAMAMLANMIŞ seansin gündemini bul (hafıza)
  // NOT: Aktif seansları hariç tut - yoksa az önce başlatılan seans "önceki seans" olarak algılanır
  const userMessages = messages.filter((m: { role: string }) => m.role === 'user');
  const isFirstMessage = userMessages.length === 1;
  let previousAgenda: string | null = null;
  let previousHomework: Array<{ text: string; completed: boolean }> = [];
  if (isFirstMessage) {
    const lastMentorSession = snap.docs
      .filter((d) => {
        const data = d.data();
        return data.mentorId === mentorId &&
               data.agenda &&
               data.status === 'completed'; // Sadece tamamlanmış seanslar
      })
      .sort((a, b) => new Date(b.data().createdAt).getTime() - new Date(a.data().createdAt).getTime())[0];
    previousAgenda = lastMentorSession?.data().agenda ?? null;
    previousHomework = lastMentorSession?.data().homework ?? [];
  }

  // Premium mentor kontrolü
  if (PREMIUM_MENTOR_IDS.includes(mentorId) && !PREMIUM_ACCESS_PLANS.includes(user.plan as never)) {
    return new Response(
      JSON.stringify({ error: 'PREMIUM_REQUIRED', mentorId }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const mentor = DEFAULT_MENTORS.find(m => m.id === mentorId);
  let systemPrompt = customSystemPrompt || mentor?.systemPrompt || 'Sen yardımcı bir asistansın.';

  // Kullanıcının test sonuçlarını system prompt'a ekle
  if (userTests.length > 0) {
    const testSummaries = userTests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3) // Son 3 test
      .map(test => {
        let summary = `\n**${test.testName}** (${new Date(test.createdAt).toLocaleDateString('tr-TR')}):\n`;

        // Skorları formatla
        const scoreLabels: Record<string, Record<string, string>> = {
          'big-five': {
            extraversion: 'Dışadönüklük',
            agreeableness: 'Uyumluluk',
            conscientiousness: 'Sorumluluk',
            neuroticism: 'Duygusal Denge',
            openness: 'Açıklık',
          },
          'eq': {
            selfAwareness: 'Öz Farkındalık',
            selfRegulation: 'Öz Yönetim',
            motivation: 'Motivasyon',
            empathy: 'Empati',
            socialSkills: 'Sosyal Beceriler',
          },
          'life-score': {
            happiness: 'Mutluluk',
            meaning: 'Anlam',
            achievement: 'Başarı',
            relationships: 'İlişkiler',
            health: 'Sağlık',
            finance: 'Finans',
            growth: 'Gelişim',
            balance: 'Denge',
            overall: 'Genel Skor',
          },
          'leadership': {
            transformational: 'Dönüşümcü Liderlik',
            transactional: 'İşlemci Liderlik',
            servant: 'Hizmetkar Liderlik',
            visionary: 'Vizyoner Liderlik',
          },
        };

        const labels = scoreLabels[test.testType] || {};
        const scoreLines = Object.entries(test.scores)
          .filter(([key]) => key !== 'overall' || test.testType === 'life-score')
          .map(([key, value]) => {
            const label = labels[key] || key;
            const level = value >= 80 ? 'Yüksek' : value >= 50 ? 'Orta' : 'Düşük';
            return `  • ${label}: ${value}/100 (${level})`;
          })
          .join('\n');

        summary += scoreLines;

        // AI analizi varsa özet olarak ekle
        if (test.analysis) {
          // Analizi kısalt - ilk 500 karakter
          const shortAnalysis = test.analysis.length > 500
            ? test.analysis.substring(0, 500) + '...'
            : test.analysis;
          summary += `\n  📝 AI Yorumu: ${shortAnalysis}`;
        }

        return summary;
      })
      .join('\n');

    systemPrompt += `\n\n🧠 **DANIŞANIN TEST SONUÇLARI:**
Bu danışan aşağıdaki testleri tamamlamış. Bu bilgileri görüşme sırasında KULLAN:
- Test sonuçlarına atıfta bulunabilirsin ("Kişilik testinde dışadönüklük skorun oldukça yüksek çıkmıştı...")
- Düşük skorlu alanlarda derinleştirici sorular sorabilirsin
- Güçlü yönleri vurgulayabilirsin
- Ancak HER YANITA test sonucu sıkıştırma, doğal akışta uygun olduğunda kullan
${testSummaries}`;
  }

  // Düşünce liderleri ve kitap bilgilerini ekle (öğrenci koçu hariç)
  const isStudentCoach = mentorId === 'student-coach';
  const books = isStudentCoach ? [] : getAllBooksForMentor(mentorId);
  const bookList = books.slice(0, 3).map(b => `• "${b.title}" – ${b.author}`).join('\n');

  // 2 rastgele düşünce lideri seç (daha az, daha odaklı)
  const shuffledLeaders = [...THOUGHT_LEADERS].sort(() => Math.random() - 0.5).slice(0, 2);
  const leaderInfo = shuffledLeaders.map(l => {
    const randomQuote = l.quotes[Math.floor(Math.random() * l.quotes.length)];
    return `• **${l.name}**: "${randomQuote}"`;
  }).join('\n');

  // Kaçıncı mesaj olduğuna göre alıntı kullanımını zorla
  const currentMessageNum = userMessages.length;
  const shouldUseQuote = currentMessageNum >= 2; // 2. mesajdan itibaren alıntı kullan
  const remainingQuestions = 10 - currentMessageNum;

  // AI'a seans durumunu bildir
  const sessionStatus = `\n\n📊 **SEANS DURUMU:** Bu ${currentMessageNum}. soru. Kullanıcının ${remainingQuestions} sorusu daha var. ${remainingQuestions > 0 ? 'KAPANIŞ YAPMA — soru sor, konuyu derinleştir, devam et!' : ''}`;

  // Öğrenci koçu için kitap önerisi yok
  const quoteInstruction = isStudentCoach
    ? (shouldUseQuote ? `\n\n🎯 **BU YANIT İÇİN — ZORUNLU:** Aşağıdaki alıntılardan BİRİNİ MUTLAKA kullan ve konuya doğal şekilde bağla. KİTAP ÖNERİSİ YAPMA.\n\nALINTILAR:\n${leaderInfo}` : '')
    : (shouldUseQuote
      ? `\n\n🎯 **BU YANIT İÇİN — ZORUNLU:**
1. Aşağıdaki alıntılardan BİRİNİ MUTLAKA kullan — atlamak YASAK
2. Alıntıyı doğal şekilde konuya bağla ("...dediği gibi" veya "...sözünü hatırlıyorum")
3. Uygun bir yerde kitap önerisinden bahset
4. Sonra konuşmaya devam et ve bir soru sor

ALINTILAR (birini seç ve kullan):
${leaderInfo}

KİTAPLAR (birinden bahsedebilirsin):
${bookList}`
      : `\n\n📚 Kullanabileceğin kaynaklar:\n${leaderInfo}\n${bookList}`);

  systemPrompt += sessionStatus + quoteInstruction;

  // Haiku küçük model — alıntı talimatını promptun başına da ekle ki atlamasın
  const useHaikuCheck = currentMessageNum > 2 && currentMessageNum < 9;
  if (useHaikuCheck && shouldUseQuote) {
    const haikuQuoteInstruction = isStudentCoach
      ? `[KRİTİK KURAL] Bu yanıtta:\n1. Aşağıdaki alıntılardan BİRİNİ doğal şekilde kullan — ATLAMAK YASAK\n2. Konuyu derinleştir\n3. Bir soru sor — KAPANIŞ YAPMA\n\nALINTILAR:\n${leaderInfo}\n\n`
      : `[KRİTİK KURAL] Bu yanıtta:\n1. Aşağıdaki alıntılardan BİRİNİ doğal şekilde kullan — ATLAMAK YASAK\n2. Uygunsa bir kitaptan bahset\n3. Konuyu derinleştir\n4. Bir soru sor — KAPANIŞ YAPMA\n\nALINTILAR:\n${leaderInfo}\nKİTAPLAR: ${bookList}\n\n`;
    systemPrompt = haikuQuoteInstruction + systemPrompt;
  }

  // Bu mentor ile daha önce hiç seans yapılmış mı kontrol et
  const hasAnyPreviousSession = snap.docs.some(d => d.data().mentorId === mentorId && d.data().status === 'completed');
  const isVeryFirstSession = !hasAnyPreviousSession && !previousAgenda;
  const isCoach = mentor?.category === 'coach';

  // İlk mesajsa ve önceki gündem varsa mentora hatırlat, yoksa ilk görüşme olduğunu belirt
  if (isFirstMessage) {
    if (previousAgenda) {
      // Ödevleri durumlarına göre formatla
      let homeworkSection = '';
      if (previousHomework.length > 0) {
        const completedCount = previousHomework.filter(h => h.completed).length;
        const pendingItems = previousHomework.filter(h => !h.completed);
        const completedItems = previousHomework.filter(h => h.completed);

        homeworkSection = `\n\n📋 ÖNCEKİ SEANS ÖDEVLERİ (${completedCount}/${previousHomework.length} tamamlandı):`;
        if (completedItems.length > 0) {
          homeworkSection += `\n✅ Tamamlanan: ${completedItems.map(h => `"${h.text}"`).join(', ')}`;
        }
        if (pendingItems.length > 0) {
          homeworkSection += `\n⏳ Tamamlanmayan: ${pendingItems.map(h => `"${h.text}"`).join(', ')}`;
        }
        homeworkSection += `\nBu ilk mesajında ödev durumunu da kısaca değerlendirip tamamlanmayanlar için motivasyon ver.`;
      }

      systemPrompt += `\n\n📌 ÖNCEKİ SEANS GÜNDEMI: "${previousAgenda}"${homeworkSection}\nBu ilk mesajında MUTLAKA şu şekilde başla: Geçen seanste konuştuğunuz konuyu kısaca hatırlat (1 cümle)${previousHomework.length > 0 ? ', ardından ödev durumunu değerlendir' : ''}, ardından "Bugün bununla devam etmek ister misin, yoksa farklı bir gündemin mi var?" diye sor. Sonra kullanıcının cevabına göre devam et.`;
    } else if (isVeryFirstSession) {
      // Bu danışanla İLK KEZ görüşülüyor - tanışma ile başla
      if (isCoach) {
        systemPrompt += `\n\n🌟 **İLK GÖRÜŞME — TANIŞ VE ALAN AÇ:**
Bu danışanla İLK KEZ görüşüyorsun. Önce tanış:
"Merhaba! Ben senin koçun olacağım. Önce biraz tanışalım — bana kendinden bahseder misin? Kim olduğunu, ne yaptığını ve hayatında şu an neler olduğunu öğrenmek isterim. Bu, seni daha iyi anlamamı sağlayacak."

Danışan kendini tanıttıktan sonra şu çerçeveyi kur:
"Bu alan tamamen senin alanın. Burada yargı yok, yönlendirme yok. Sana cevap vermeyeceğim ama doğru sorularla kendi cevaplarını bulmanı destekleyeceğim. Bugün bu görüşmeden senin için en değerli olacak şey ne olurdu?"

"Geçen seans", "daha önce konuştuk", "hatırlarsın" gibi ifadeler KULLANMA.`;
      } else {
        // Mentor için ilk görüşme
        systemPrompt += `\n\n🌟 **İLK GÖRÜŞME — TANIŞ:**
Bu danışanla İLK KEZ görüşüyorsun. Önce tanış:
"Merhaba! Ben senin mentorun olacağım. Önce biraz tanışalım — bana kendinden bahseder misin? Ne yaptığını, hangi alanda ilerlemeye çalıştığını ve şu an neler yaşadığını öğrenmek isterim. Bu, sana daha iyi yardımcı olmamı sağlayacak."

Danışan kendini tanıttıktan sonra:
"Bu görüşmede hem senin bakış açını netleştireceğiz hem de istersen sana bazı öneriler ve farklı perspektifler sunabilirim. Bugün senin için en önemli konu ne?"

"Geçen seans", "daha önce konuştuk", "hatırlarsın" gibi ifadeler KULLANMA.`;
      }
    } else {
      // Önceki seans var ama gündem kaydedilmemiş
      if (isCoach) {
        systemPrompt += `\n\n⚠️ Bu kullanıcıyla daha önce görüştün ama gündem kaydı yok. Normal açılış yap:
"Bugün senin için en önemli konu ne? Bu görüşmenin sonunda neyin netleşmiş olmasını istersin?"`;
      } else {
        systemPrompt += `\n\n⚠️ Bu kullanıcıyla daha önce görüştün ama gündem kaydı yok. Normal açılış yap:
"Bu görüşmede hem senin bakış açını netleştireceğiz hem de istersen sana bazı öneriler ve farklı perspektifler sunabilirim. Bugün senin için en önemli konu ne?"`;
      }
    }
  }

  // Kapanış kontrolü: gizli __KAPANIS__ mesajı veya flag
  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
  const lastUserText = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content :
    Array.isArray(lastUserMsg?.parts) ? lastUserMsg.parts.filter((p: { type: string }) => p.type === 'text').map((p: { text?: string }) => p.text ?? '').join('') : '';
  const isClosingRequest = lastUserText.trim() === '__KAPANIS__';
  const userMessageCount = messages.filter((m: { role: string }) => m.role === 'user').length;
  const isLastMessage = isLastMsg === true || isClosingRequest || userMessageCount >= 10;

  if (isLastMessage) {
    // Her seansta kitap önerisi yap (öğrenci koçu hariç)
    const book = isStudentCoach ? null : getBookForMentor(mentorId);
    const bookLine = book
      ? `\n📚 **Kitap Önerisi (Bu Seans İçin Ödev):** "${book.title}" – ${book.author} kitabını oku. Bu kitap, konuştuğumuz konularla doğrudan bağlantılı ve gelişim yolculuğuna katkı sağlayacak.`
      : '';

    // Seans hakkı bittiyse yeniden gelmeye davet et
    const sessionLimit = user.sessionLimit ?? (user.plan ? PLAN_LIMITS[user.plan] : 1);
    const isLimitReached = snap.size + 1 >= sessionLimit;
    const inviteLine = isLimitReached
      ? `\n\n💡 **Not:** Bu seans hakkın sona erdi. Gelişim yolculuğuna devam etmek için yeni seans paketi alabilirsin. Seni tekrar görmek isterim!`
      : `\n\nGelişim yolculuğunda seninle çalışmak bir zevkti. Bir sonraki seansta görüşmek üzere!`;

    const closingInstruction = `🔴 KAPANIŞ YANITI — BU KURALI KESİNLİKLE UYGULA — SORU SORMA:
Bu seanstaki son yanıttır. Aşağıdaki formatı AYNEN uygula, soru sormak YASAKTIR:

---
[2-3 cümleyle seans özeti — "Bu seansta..." ile başla]

**Bu seanstan çıkan ödevlerin:**
1. [Somut eylem adımı — tarih veya ölçüt içersin]
2. [Somut eylem adımı — tarih veya ölçüt içersin]
3. [Somut eylem adımı — tarih veya ölçüt içersin]${bookLine}
${inviteLine}

[Kısa, sıcak veda — "Başarılar!", "Seninle çalışmak güzeldi!" gibi]
---

TEKRAR: Hiçbir soru sormayacaksın. Sadece özet + ödev listesi + veda.\n\n`;
    systemPrompt = closingInstruction + systemPrompt;
  }

  // UIMessage (parts) → CoreMessage (content) dönüşümü — tüm mesajları gönder
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coreMessages = messages.slice(-20).map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: typeof m.content === 'string'
      ? m.content
      : Array.isArray(m.parts)
        ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
        : '',
  }));

  // İlk 2 ve son 2 mesaj Sonnet, ortası Haiku
  const useHaiku = currentMessageNum > 2 && currentMessageNum < 9;
  const selectedModel = useHaiku
    ? anthropic('claude-haiku-4-5-20251001')
    : anthropic('claude-sonnet-4-6');

  try {
    const result = streamText({
      model: selectedModel,
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 2048,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('Chat error:', err);
    return new Response(JSON.stringify({ error: 'AI yanıt üretemedi.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
