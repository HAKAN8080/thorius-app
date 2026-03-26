export interface BookRecommendation {
  title: string;
  author: string;
}

export interface ThoughtLeader {
  name: string;
  title: string;
  quotes: string[];
  keyIdeas: string[];
}

// ─── DÜŞÜNCE LİDERLERİ VE ALINTILARI ────────────────────────────────────────
export const THOUGHT_LEADERS: ThoughtLeader[] = [
  {
    name: 'Stephen R. Covey',
    title: 'Liderlik ve kişisel gelişim uzmanı',
    quotes: [
      'Önce anlamaya çalış, sonra anlaşılmaya.',
      'Önemli olanla acil olanı birbirinden ayırın.',
      'Başlamadan önce sonucu hayal edin.',
      'Proaktif olun — tepki vermeyin, inisiyatif alın.',
      'Kazan-kazan düşüncesi, bolluk zihniyetinden doğar.',
      'Güven, ilişkilerin para birimidir.',
    ],
    keyIdeas: [
      '7 Alışkanlık: Proaktif ol, sonunu düşünerek başla, önce önemli işleri yap, kazan-kazan düşün, önce anla sonra anlaşıl, sinerji yarat, baltayı bile',
      'Etki Çemberi vs Endişe Çemberi — enerjini değiştirebileceklerine odakla',
      'Karakter Etiği vs Kişilik Etiği — kalıcı başarı içten dışa doğru inşa edilir',
    ]
  },
  {
    name: 'Simon Sinek',
    title: 'Liderlik teorisyeni, "Start With Why" yazarı',
    quotes: [
      'İnsanlar ne yaptığınızı değil, neden yaptığınızı satın alır.',
      'Liderlik bir pozisyon değil, bir karardır.',
      'Güven tutarlılığın sonucudur.',
      'Büyük liderler kendilerini güvende hissettirirler.',
      'Vizyon, henüz var olmayan bir geleceği görmektir.',
      'Sonsuz oyunu oyna — amaç kazanmak değil, oyunda kalmaktır.',
    ],
    keyIdeas: [
      'Altın Çember: Neden → Nasıl → Ne (içten dışa iletişim)',
      'Sonsuz Oyun: Kısa vadeli kazançlar yerine uzun vadeli sürdürülebilirlik',
      'Liderler En Son Yer: Güvenlik çemberi oluştur, ekibin risk almasını sağla',
    ]
  },
  {
    name: 'Daniel Goleman',
    title: 'Duygusal zeka kavramının öncüsü',
    quotes: [
      'IQ kapıyı açar, EQ içeri sokar.',
      'Duygularını yönetemeyen biri başkalarını yönetemez.',
      'Empati, liderliğin en az değer verilen ama en güçlü aracıdır.',
      'Öz farkındalık, duygusal zekanın temelidir.',
      'En iyi liderler duruma göre stil değiştirir.',
    ],
    keyIdeas: [
      '5 EQ Bileşeni: Öz farkındalık, öz düzenleme, motivasyon, empati, sosyal beceriler',
      '6 Liderlik Stili: Zorlayıcı, otoriter, bağ kurucu, demokratik, hız belirleyici, koçluk yapan',
      'Duygusal Bulaşma: Liderin duyguları ekibe yayılır — pozitif iklim yarat',
    ]
  },
  {
    name: 'Jim Collins',
    title: '"Good to Great" yazarı, iş stratejisti',
    quotes: [
      'İyiden mükemmele geçiş, önce kimi otobüse alacağınla başlar.',
      'Disiplinli insanlar + Disiplinli düşünce + Disiplinli eylem = Mükemmellik',
      'Harika şirketler acımasız gerçeklerle yüzleşir ama inancını kaybetmez.',
      'Kirpi Konsepti: Bir şeyde dünyanın en iyisi ol.',
      'Seviye 5 liderlik alçakgönüllülük ve kararlılığı birleştirir.',
    ],
    keyIdeas: [
      'Kirpi Konsepti: Tutkun + Ekonomik motor + En iyi olabileceğin şey',
      'Volan Etkisi: Küçük tutarlı itişler büyük momentum yaratır',
      'Stockdale Paradoksu: Acı gerçeklerle yüzleş ama sonunda başaracağına inan',
    ]
  },
  {
    name: 'Brené Brown',
    title: 'Kırılganlık ve cesaret araştırmacısı',
    quotes: [
      'Kırılganlık cesaretin doğum yeridir.',
      'Mükemmeliyetçilik bir zırh değil, ağır bir yüktür.',
      'Açık yüreklilik risk alır ama bağlantı kurar.',
      'Utanç karanlıkta büyür, ışığa çıkarınca küçülür.',
      'Liderlik cevap vermek değil, doğru soruları sormaktır.',
    ],
    keyIdeas: [
      'Cesur Liderlik: Zor konuşmaları yap, kırılganlığı kucakla',
      'Arena\'ya Çık: Eleştiri alsan bile sahada ol, tribünde değil',
      'Değer Temelli Yaşam: Değerlerini tanı ve onlara göre hareket et',
    ]
  },
  {
    name: 'Carol Dweck',
    title: 'Gelişim zihniyeti (Growth Mindset) teorisyeni',
    quotes: [
      'Sabit zihniyet yetenekle sınırlar, gelişim zihniyeti çabayla büyür.',
      '"Henüz" kelimesi her şeyi değiştirir.',
      'Başarısızlık bir son değil, veri noktasıdır.',
      'Zorluklardan kaçmak yerine onları kucakla.',
      'Yetenekler geliştirilebilir — beyin bir kas gibidir.',
    ],
    keyIdeas: [
      'Sabit vs Gelişim Zihniyeti: Yetenek sabit mi, geliştirilebilir mi?',
      '"Henüz" Gücü: "Yapamıyorum" yerine "Henüz yapamıyorum"',
      'Çaba Övgüsü: Sonuç yerine süreci ve çabayı ödüllendir',
    ]
  },
  {
    name: 'Marshall Goldsmith',
    title: 'Yönetici koçu, davranış değişimi uzmanı',
    quotes: [
      'Seni buraya getiren şey, seni oraya götürmez.',
      'Başarılı insanların en büyük sorunu: başarılarının nedenini yanlış bilmeleri.',
      'Geri bildirim bir hediyedir — reddetme, değerlendir.',
      'Değişim için ödeme yapmaya hazır mısın?',
      'Bırak, devam et, başla — üç büyülü soru.',
    ],
    keyIdeas: [
      '20 Kötü Alışkanlık: Kazanma takıntısı, değer katmama dürtüsü, yıkıcı yorumlar...',
      'Feedforward: Geçmiş yerine gelecek odaklı öneriler al',
      'Tetikleyiciler: Çevre davranışı tetikler — ortamını tasarla',
    ]
  },
  {
    name: 'Adam Grant',
    title: 'Organizasyonel psikolog, Wharton profesörü',
    quotes: [
      'Vericiler uzun vadede kazanır.',
      'Orijinal düşünürler şüphe eder ama harekete geçer.',
      'En iyi fikirler genellikle "ama biz hep böyle yaptık"a meydan okur.',
      'Yeniden düşünmek, düşünmekten daha önemli hale geldi.',
      'Potansiyel, bugün nerede olduğun değil, ne kadar uzağa gidebileceğindir.',
    ],
    keyIdeas: [
      'Verici-Alıcı-Eşleştirici: Uzun vadede cömert olanlar kazanır',
      'Yeniden Düşünme: Fikirlerine bağlanma, sürekli sorgula',
      'Psikolojik Güvenlik: Ekibin hata yapma özgürlüğü = inovasyon',
    ]
  },
  {
    name: 'Peter Drucker',
    title: 'Modern yönetimin babası',
    quotes: [
      'Ölçemediğini yönetemezsin.',
      'Geleceği tahmin etmenin en iyi yolu onu yaratmaktır.',
      'Verimlilik işleri doğru yapmaktır, etkililik doğru işleri yapmaktır.',
      'Kültür stratejiyi kahvaltıda yer.',
      'Bir lider olarak ilk ve en önemli işin kendi enerjini yönetmektir.',
    ],
    keyIdeas: [
      'Bilgi İşçisi: 21. yüzyılda değer bilgiyle üretilir',
      'MBO (Hedeflerle Yönetim): Net hedefler koy, sonuçları ölç',
      'Etkili Yönetici: Zamanını yönet, katkına odaklan, güçlere yaslan',
    ]
  },
  {
    name: 'James Clear',
    title: 'Alışkanlık uzmanı, "Atomic Habits" yazarı',
    quotes: [
      'Her gün %1 daha iyi ol — bir yılda 37 kat büyürsün.',
      'Hedeflere değil, sistemlere odaklan.',
      'Alışkanlıklar kimliğin oylarıdır.',
      'Ortamı değiştir, davranış değişir.',
      'Motivasyon geçicidir, sistemler kalıcıdır.',
    ],
    keyIdeas: [
      '4 Alışkanlık Yasası: Görünür kıl, çekici kıl, kolay kıl, tatmin edici kıl',
      'Kimlik Temelli Alışkanlık: "Koşucu olmak istiyorum" değil "Ben bir koşucuyum"',
      'Alışkanlık Yığını: Mevcut alışkanlığa yenisini ekle',
    ]
  },
  {
    name: 'Mustafa Kemal Atatürk',
    title: 'Türkiye Cumhuriyeti\'nin kurucusu, lider ve vizyoner',
    quotes: [
      'Hayatta en hakiki mürşit ilimdir.',
      'Başarı, yalnızca başarmak için çalışanlara gelir.',
      'Benim için dünyada en büyük mevki ve mükafat, milletin bir ferdi olarak yaşamaktır.',
      'Zorluklar karşısında daima kendine güven ve azim ile ilerle.',
      'Geleceği göremeyenler, bugünü de kavrayamazlar.',
      'Biz cahil dediğimiz zaman, mektepte okumamış olanları kastetmiyoruz. Kastettiğimiz ilim, hakikati bilmektir.',
      'Büyük işler, önemli güçlükler karşısında soğukkanlılığını koruyabilenler tarafından başarılır.',
      'Bir millet ki resim yapmaz, bir millet ki heykel yapmaz, bir millet ki tekniğin gerektirdiği şeyleri yapmaz; itiraf etmeli ki o milletin ilerleme yolunda yeri yoktur.',
      'Egemenlik kayıtsız şartsız milletindir.',
      'Yurtta sulh, cihanda sulh.',
    ],
    keyIdeas: [
      'Akılcılık ve Bilim: Toplumsal ilerlemenin temeli bilim ve akıldır',
      'Bağımsızlık: Tam bağımsızlık, siyasi, mali, iktisadi, adli, askeri, kültürel bağımsızlıktır',
      'Çağdaşlaşma: Muasır medeniyetler seviyesine ulaşmak',
      'Milli Birlik: Ortak değerler etrafında birlik ve beraberlik',
    ]
  },
];

// Mentor tipine göre uygun düşünce liderleri
const LEADER_BY_CATEGORY: Record<string, string[]> = {
  leadership: ['Stephen R. Covey', 'Simon Sinek', 'Daniel Goleman', 'Jim Collins', 'Marshall Goldsmith', 'Mustafa Kemal Atatürk'],
  personal: ['Brené Brown', 'Carol Dweck', 'Stephen R. Covey', 'James Clear', 'Mustafa Kemal Atatürk'],
  entrepreneurship: ['Simon Sinek', 'Peter Drucker', 'Adam Grant', 'Jim Collins', 'Mustafa Kemal Atatürk'],
  mindfulness: ['Carol Dweck', 'James Clear', 'Brené Brown'],
  psychology: ['Daniel Goleman', 'Brené Brown', 'Carol Dweck', 'Adam Grant'],
};

export function getThoughtLeaderForMentor(mentorId: string): ThoughtLeader {
  const category = MENTOR_CATEGORY_MAP[mentorId] ?? 'personal';
  const leaderNames = LEADER_BY_CATEGORY[category] ?? LEADER_BY_CATEGORY.personal;
  const randomName = leaderNames[Math.floor(Math.random() * leaderNames.length)];
  return THOUGHT_LEADERS.find(l => l.name === randomName) ?? THOUGHT_LEADERS[0];
}

export function getRandomQuote(mentorId: string): { leader: string; quote: string } {
  const thoughtLeader = getThoughtLeaderForMentor(mentorId);
  const quote = thoughtLeader.quotes[Math.floor(Math.random() * thoughtLeader.quotes.length)];
  return { leader: thoughtLeader.name, quote };
}

export function getAllBooksForMentor(mentorId: string): BookRecommendation[] {
  const category = MENTOR_CATEGORY_MAP[mentorId] ?? 'personal';
  return BOOKS_BY_CATEGORY[category] ?? BOOKS_BY_CATEGORY.personal;
}

const BOOKS_BY_CATEGORY: Record<string, BookRecommendation[]> = {
  personal: [
    { title: 'Etkili İnsanların 7 Alışkanlığı', author: 'Stephen R. Covey' },
    { title: 'İnsanın Anlam Arayışı', author: 'Viktor E. Frankl' },
    { title: 'İçindeki Devi Uyandır', author: 'Tony Robbins' },
    { title: 'Dört Anlaşma', author: 'Don Miguel Ruiz' },
    { title: 'Savaşçı', author: 'Doğan Cüceloğlu' },
    { title: 'Şu Hortumlu Dünyada Fil Yalnız Bir Hayvandır', author: 'Ahmet Şerif İzgören' },
    { title: 'Özşefkat', author: 'Kristin Neff' },
    { title: 'Şimdinin Gücü', author: 'Eckhart Tolle' },
  ],
  leadership: [
    { title: 'Duygusal Zeka', author: 'Daniel Goleman' },
    { title: 'Takım Oyunu', author: 'Seth Godin' },
    { title: 'İyiden Mükemmele', author: 'Jim Collins' },
    { title: 'Liderliğin Kutsal Kitabı', author: 'Jeffrey Gitomer' },
    { title: 'What Got You Here Won\'t Get You There', author: 'Marshall Goldsmith' },
    { title: 'Leaders Eat Last', author: 'Simon Sinek' },
  ],
  entrepreneurship: [
    { title: 'Zengin Baba Yoksul Baba', author: 'Robert T. Kiyosaki' },
    { title: 'Düşün ve Zengin Ol', author: 'Napoleon Hill' },
    { title: 'Mor İnek', author: 'Seth Godin' },
    { title: 'Steve Jobs Olsa Ne Yapardı?', author: 'Çeşitli Yazarlar' },
    { title: 'Atomic Habits', author: 'James Clear' },
    { title: 'The Lean Startup', author: 'Eric Ries' },
  ],
  psychology: [
    { title: 'Nietzsche Ağladığında', author: 'Irvin D. Yalom' },
    { title: 'Dost Kazanma ve İnsanları Etkileme Sanatı', author: 'Dale Carnegie' },
    { title: 'Hayatı Yeniden Keşfedin', author: 'Jeffrey E. Young' },
    { title: 'Attached', author: 'Amir Levine' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman' },
  ],
  mindfulness: [
    { title: 'Mindset', author: 'Carol S. Dweck' },
    { title: 'The 5 AM Club', author: 'Robin Sharma' },
    { title: 'Bazen Olmaz', author: 'Mark Manson' },
  ],
};

// Mentör ID'sine göre kitap kategorisi
const MENTOR_CATEGORY_MAP: Record<string, keyof typeof BOOKS_BY_CATEGORY> = {
  'executive-coach': 'leadership',
  'career-coach': 'personal',
  'student-coach': 'mindfulness',
  'tech-mentor': 'entrepreneurship',
  'business-mentor': 'leadership',
  'startup-mentor': 'entrepreneurship',
  'reverse-mentor': 'mindfulness',
};

export function getBookForMentor(mentorId: string): BookRecommendation {
  const category = MENTOR_CATEGORY_MAP[mentorId] ?? 'personal';
  const books = BOOKS_BY_CATEGORY[category];
  return books[Math.floor(Math.random() * books.length)];
}
