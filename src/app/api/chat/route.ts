import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { DEFAULT_MENTORS, PREMIUM_MENTOR_IDS } from '@/lib/types';
import { getCurrentUser, PLAN_LIMITS } from '@/lib/auth';
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
  }

  // Premium mentor kontrolü
  if (PREMIUM_MENTOR_IDS.includes(mentorId) && user.plan !== 'premium') {
    return new Response(
      JSON.stringify({ error: 'PREMIUM_REQUIRED', mentorId }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const mentor = DEFAULT_MENTORS.find(m => m.id === mentorId);
  let systemPrompt = customSystemPrompt || mentor?.systemPrompt || 'Sen yardımcı bir asistansın.';

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
    ? (shouldUseQuote ? `\n\n🎯 **BU YANIT İÇİN:** Aşağıdaki alıntılardan BİRİNİ kullanabilirsin (zorunlu değil). KİTAP ÖNERİSİ YAPMA.\n\nALINTILAR:\n${leaderInfo}` : '')
    : (shouldUseQuote
      ? `\n\n🎯 **BU YANIT İÇİN:** Aşağıdaki alıntılardan BİRİNİ MUTLAKA kullan, doğal şekilde konuya bağla, ardından konuşmaya devam et ve bir soru sor.\n\nALINTILAR:\n${leaderInfo}\n\nKİTAPLAR:\n${bookList}`
      : `\n\n📚 Kullanabileceğin kaynaklar:\n${leaderInfo}\n${bookList}`);

  systemPrompt += sessionStatus + quoteInstruction;

  // Haiku küçük model — alıntı talimatını promptun başına da ekle ki atlamasın
  const useHaikuCheck = currentMessageNum > 2 && currentMessageNum < 9;
  if (useHaikuCheck && shouldUseQuote && !isStudentCoach) {
    systemPrompt = `[ZORUNLU] Bu yanıtta:\n1. Aşağıdaki alıntılardan BİRİNİ doğal şekilde kullan\n2. Konuyu derinleştir\n3. Bir soru sor — KAPANIŞ YAPMA\n\nALINTILAR:\n${leaderInfo}\nKİTAPLAR: ${bookList}\n\n` + systemPrompt;
  }

  // İlk mesajsa ve önceki gündem varsa mentora hatırlat, yoksa ilk görüşme olduğunu belirt
  if (isFirstMessage) {
    if (previousAgenda) {
      systemPrompt += `\n\n📌 ÖNCEKİ SEANS GÜNDEMI: "${previousAgenda}"\nBu ilk mesajında MUTLAKA şu şekilde başla: Geçen seanste konuştuğunuz konuyu kısaca hatırlat (1 cümle), ardından "Bugün bununla devam etmek ister misin, yoksa farklı bir gündemin mi var?" diye sor. Sonra kullanıcının cevabına göre devam et.`;
    } else {
      systemPrompt += `\n\n⚠️ ÖNEMLİ: Bu kullanıcıyla İLK KEZ görüşüyorsun. Daha önce hiç seans yapmadınız. "Geçen seans", "daha önce konuştuk", "hatırlarsın" gibi ifadeler KULLANMA. Direkt bugünkü gündemini sor: "Bugün hangi konuda çalışmak istersin?" veya "Bugün seni buraya ne getirdi?" gibi bir açılış yap.`;
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
    const isFirstSession = snap.size === 0;
    const book = isFirstSession ? getBookForMentor(mentorId) : null;
    const bookLine = book
      ? `\n📚 **Kitap Önerisi (Bu Seans İçin Ödev):** "${book.title}" – ${book.author} kitabını oku. Bu kitap, konuştuğumuz konularla doğrudan bağlantılı ve gelişim yolculuğuna katkı sağlayacak.`
      : '';

    const closingInstruction = `🔴 KAPANIŞ YANITI — BU KURALI KESİNLİKLE UYGULA — SORU SORMA:
Bu seanstaki son yanıttır. Aşağıdaki formatı AYNEN uygula, soru sormak YASAKTIR:

---
[2-3 cümleyle seans özeti — "Bu seansta..." ile başla]

**Bu seanstan çıkan ödevlerin:**
1. [Somut eylem adımı]
2. [Somut eylem adımı]
3. [Somut eylem adımı]${bookLine}

[Kısa, sıcak veda — "Başarılar!", "Bol şans!" gibi]
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
