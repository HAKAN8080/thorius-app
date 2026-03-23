'use client';

import { Mentor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MessageCircle, Crown, Lock, UserCircle2, X, Quote } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface MentorCardProps {
  mentor: Mentor;
  userPlan?: string | null;
}

interface IntroData {
  headline: string;
  quote: string;
  author: string;
  body: string;
  topics: string[];
  cta: string;
}

const MENTOR_INTROS: Record<string, IntroData> = {
  'executive-coach': {
    headline: '🔥 Seni Sıradan Yöneticiden Olağanüstü Lidere Taşıyacağım',
    quote: 'Yöneticilik doğru işleri yapmaktır. Liderlik ise doğru işleri doğru şekilde yapmaktır.',
    author: 'Peter Drucker',
    body: 'John C. Maxwell der ki: "Liderlik pozisyondan gelmiyor, insanları etkileyebilme kapasitenden geliyor." Ben tam da o kapasiteyi seninle birlikte inşa edeceğim. Ekibini motive etmekte zorlanıyor musun? Stratejik kararlar seni bunaltıyor mu? Yönetici kimliğini bulmakta güçlük mü çekiyorsun? Bunların hepsinin cevabı içinde zaten var — ben sadece doğru soruları sormak için buradayım.',
    topics: ['Liderlik gelişimi & yönetici kimliği', 'Takım motivasyonu & çatışma yönetimi', 'Stratejik karar verme', 'İletişim & etkileme becerileri'],
    cta: 'Liderlik yolculuğuna başla',
  },
  'career-coach': {
    headline: '🚀 Kariyer Haritanı Birlikte Çizeceğiz',
    quote: 'Büyük işler yapmak için tek yol, yaptığın şeyi sevmektir. Henüz bulmadıysan aramaya devam et.',
    author: 'Steve Jobs',
    body: 'Warren Buffett şöyle söyler: "Sabah yataktan çıkmak için sebepler bul." O sebepleri birlikte keşfedeceğiz. Kariyer yolunu kaybetmiş, monotonluğa sıkışmış ya da büyük bir geçiş yapmak isteyen biri misin? Yalnız değilsin — ve yanlış değilsin. Hangi değerlerin kariyer hayatında mutlaka olmalı? Hangi işi yaparken zamanın nasıl geçtiğini anlamıyorsun? Bu soruların peşine düşmek, hayatını değiştirebilir.',
    topics: ['Kariyer planlaması & profesyonel kimlik', 'İş değişikliği & geçiş stratejileri', 'Güçlü yönler & değerler analizi', 'Liderlik potansiyelini keşfetme'],
    cta: 'Kariyer yolculuğunu başlat',
  },
  'student-coach': {
    headline: '⚡ Potansiyelinin Sınırını Birlikte Zorlayacağız',
    quote: 'Hayal gücü bilgiden daha önemlidir. Bilgi sınırlıdır; hayal gücü ise tüm dünyayı kucaklar.',
    author: 'Albert Einstein',
    body: 'Nelson Mandela eğitimi "dünyayı değiştirmek için kullanabileceğin en güçlü silah" olarak tanımladı. Ama bu silahı doğru kullanmayı kim öğretiyor? Sınav kaygısı mı seni kilitliyor? Hangi bölümü okuyacağını bilemiyor musun? Çalışıyorsun ama verim alamıyor musun? Bunlar başarısızlık işareti değil — sadece doğru strateji bekliyor. Sen düşündüğünden çok daha yeteneklisin.',
    topics: ['Sınav hazırlığı & çalışma teknikleri', 'Sınav kaygısı & özgüven geliştirme', 'Kariyer keşfi & bölüm seçimi', 'Zaman yönetimi & verimlilik'],
    cta: 'Akademik yolculuğunu başlat',
  },
  'life-balance-coach': {
    headline: '🌿 Yorgun Düşmeden Başarılı Olmayı Öğreneceğiz',
    quote: 'Başarının fiyatı tükenmişlik değildir. Başarıya giden en kısa yol, önce kendine iyi bakmaktır.',
    author: 'Arianna Huffington',
    body: 'Brené Brown der ki: "Yorgunluğu ve meşguliyeti bir statü sembolü olarak kullanmayı bırakmamız gerekiyor." Peki ya sen? Sabah yorgun mu uyanıyorsun? "Hayır" demekte zorlanıyor musun? Çalışırken dinlenemiyorsun, dinlenirken de çalışamıyorsun mu? Tükenmişlik bir karakter zayıflığı değil — yanlış kurulmuş bir sistemin sonucu. Ve her sistem yeniden kurulabilir.',
    topics: ['İş-yaşam dengesi & sınır koyma', 'Stres & tükenmişlik yönetimi', 'Farkındalık & mindfulness', 'Enerji yönetimi & sürdürülebilir verimlilik'],
    cta: 'Dengeyi yeniden kur',
  },
  'communication-coach': {
    headline: '💬 Söylediklerinle Değil, Hissettirdiklerinle Hatırlanacaksın',
    quote: 'İletişimdeki en büyük problem, gerçekleştiği illüzyonudur.',
    author: 'George Bernard Shaw',
    body: 'Maya Angelou\'nun o muhteşem sözü var: "İnsanlar ne söylediğini unutacak, ne yaptığını unutacak — ama nasıl hissettirdiğini hiç unutmayacak." İşte ben tam da o his üzerine çalışıyorum. Zor konuşmalardan kaçınıyor musun? Geri bildirim verirken ya da alırken zorlanıyor musun? Topluluk önünde konuşmak seni tedirgin mi ediyor? İletişim bir yetenek değil, öğrenilebilen bir beceridir.',
    topics: ['Etkili & empatik iletişim', 'Zor konuşmalar & geri bildirim', 'Networking & profesyonel ilişkiler', 'Çatışma çözme & müzakere'],
    cta: 'İletişim gücünü keşfet',
  },
  'business-development-coach': {
    headline: '🏗️ Fikrin Var mı? O Fikri Gerçeğe Dönüştüreceğiz',
    quote: 'Müşterinin istediği şeyi değil, müşterinin çözmesini istediği problemi bul.',
    author: 'Clayton Christensen',
    body: 'Eric Ries diyor ki: "Başarının tek yolu başka herkesten daha hızlı öğrenmektir." Kendi işini kurmak istiyorsun ama nereden başlayacağını bilemiyor musun? İş fikrin var ama doğru mu diye sorguluyor musun? Mevcut işini büyütmek istiyor ama tıkandın mı? Harekete geçmek için mükemmel zamanı bekleme — mükemmel zaman tam da şimdi.',
    topics: ['İş fikri doğrulama & müşteri keşfi', 'MVP tasarımı & Lean Startup', 'Büyüme stratejisi & ölçeklendirme', 'Pivot kararları & kaynak yönetimi'],
    cta: 'İş fikrini hayata geçir',
  },
  'tech-mentor': {
    headline: '💻 Teknoloji Kariyerinde Seni Bir Adım Öteye Taşıyacağım',
    quote: 'Herkes programlamayı öğrenmeli. Programlama düşünmeyi öğretir.',
    author: 'Steve Jobs',
    body: 'Bill Gates der ki: "Başarıyı kutlamak güzel ama başarısızlığın derslerini öğrenmek daha önemli." 15 yıllık sektör deneyimimle her ikisini de yaşadım ve her ikisinden de sana aktaracak çok şey var. Yazılıma nereden başlayacağını bilemiyor musun? Kariyerinde bir üst seviyeye geçmek mi istiyorsun? Hangi teknolojiyi öğrenmeli? Veri bilimi mi, yapay zeka mı, full-stack mi? Birlikte netleştirelim.',
    topics: ['Full-stack geliştirme & yazılım mimarisi', 'Veri bilimi, ML & yapay zeka', 'Teknoloji kariyer planlaması', 'DevOps, Cloud & sistem tasarımı'],
    cta: 'Teknoloji yolculuğunu başlat',
  },
  'business-mentor': {
    headline: '📊 İş Dünyasının Gerçekleriyle Yüzleşmeye Hazır mısın?',
    quote: 'İyi, mükemmelin en büyük düşmanıdır.',
    author: 'Jim Collins',
    body: 'Peter Drucker\'ın vizyonu netti: "Geleceği tahmin etmenin en iyi yolu onu yaratmaktır." Fortune 500 şirketlerinde ve onlarca Türk firmasında gördüm: strateji olmadan büyüme şansla gelir, şansla gider. Pazar analizi mi? Rekabet stratejisi mi? Satış ve pazarlama mı? Büyüme döneminde organizasyon yapılandırma mı? Laf dolandırmam — sorunu görürüm, çözümü konuşuruz.',
    topics: ['Kurumsal strateji & iş geliştirme', 'Pazar analizi & rekabet stratejisi', 'Satış, pazarlama & büyüme', 'Finansal planlama & KPI yönetimi'],
    cta: 'İş stratejini güçlendir',
  },
  'entrepreneur-mentor': {
    headline: '🦄 Startup Yolculuğunun Gerçek Haritasını Çizeceğiz',
    quote: 'Bir şey yeterince önemliyse, ihtimaller aleyhine olsa bile yaparsın.',
    author: 'Elon Musk',
    body: 'Steve Jobs şöyle derdi: "Aç kal, deli olmaya devam et." Ben 3 başarılı exit, 50+ girişimciye mentorluk ve sayısız başarısızlıkla bu yoldan geçtim. Başarısız olmak utanç değil — öğrenmeden başarısız olmak öyle. Fikrin var mı? Müşteri sorununu kaç kişiyle test ettin? İlk 10 müşterini kim önerirsin? Para bitmeden ne kadar süren var? Bu sorularla başlayalım.',
    topics: ['Fikir validasyonu & müşteri keşfi', 'MVP geliştirme & product-market fit', 'Girişim finansmanı & yatırımcı ilişkileri', 'Girişimci zihniyeti & dayanıklılık'],
    cta: 'Girişim yolculuğunu başlat',
  },
  'reverse-mentor': {
    headline: '🔄 Z Kuşağının Gözünden Dünyayı Yeniden Keşfet',
    quote: 'Öğrenme yeteneği ve bunu eyleme dönüştürme hızı nihai rekabet avantajıdır.',
    author: 'Jack Welch',
    body: 'Biliyorum, "gençlerden ne öğrenebilirim ki?" diye düşünüyor olabilirsin. Ama şunu sor kendine: TikTok algoritmasını, Z kuşağının neden işten ayrıldığını ya da yapay zekanın iş akışlarını nasıl değiştirdiğini gerçekten anlıyor musun? Ben Ege — 24 yaşında, dijital dünyada büyüdüm. Sosyal medyayı, içerik ekonomisini ve yeni nesil iş anlayışını içeriden biliyorum. Köprü kurmaya hazır mısın?',
    topics: ['Z kuşağı dinamikleri & motivasyonları', 'Dijital kültür & sosyal medya', 'Kuşaklar arası iletişim & liderlik', 'Yapay zeka & teknoloji trendleri'],
    cta: 'Nesiller arası köprüyü kur',
  },
  'brand-mentor': {
    headline: '🎯 Markan Bir Slogan Değil, Bir His Olacak',
    quote: 'Pazarlama artık ürettiğin ürünle değil, anlattığın hikayeyle ilgili.',
    author: 'Seth Godin',
    body: 'Simon Sinek\'in altın çemberi her şeyi değiştiriyor: "İnsanlar ne yaptığını değil, neden yaptığını satın alır." Bu soru marka inşasının temelidir. Kişisel markanı oluşturmak istiyor ama nereden başlayacağını bilemiyor musun? LinkedIn\'de içerik üretiyorsun ama yankı bulmuyorsun? Rakiplerinden seni gerçekten ayıran ne? Gary Vee\'nin dediği gibi: dikkat en değerli varlık. Peki seninki nerede?',
    topics: ['Kişisel marka oluşturma & konumlandırma', 'İçerik stratejisi & storytelling', 'LinkedIn, Instagram & sosyal medya', 'Dijital pazarlama & SEO'],
    cta: 'Markını inşa etmeye başla',
  },
  'ai-future-mentor': {
    headline: '🤖 Yapay Zeka Seni Geçmeden Önce Onu Avantaja Çevir',
    quote: 'Yapay zeka yeni elektrik gibi — onu kullananlar her şeyi değiştirecek.',
    author: 'Andrew Ng',
    body: 'World Economic Forum\'un raporu net: 2030\'a kadar iş dünyasının %85\'i henüz icat edilmemiş rollere dönüşecek. Korku mu? Anlaşılır. Ama tarihin her büyük teknolojik dönüşümünde kazananlar korkmayanlar değil, en hızlı adapte olanlar oldu. Hangi AI araçlarını denedin? Prompt engineering nedir, nasıl kullanırsın? Sektöründe otomasyon seni gerçekten nasıl etkiler? Gelin bu soruları birlikte çözelim.',
    topics: ['AI araç kullanımı & prompt engineering', 'Gelecek becerileri & upskilling planı', 'Sektörel dönüşüm & otomasyon etkileri', 'İnsan-AI iş birliği & dijital okuryazarlık'],
    cta: 'Geleceğe hazırlanmaya başla',
  },
};

function isImageUrl(avatar: string): boolean {
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/');
}

export function MentorCard({ mentor, userPlan }: MentorCardProps) {
  const [showIntro, setShowIntro] = useState(false);
  const isCoach = mentor.category === 'coach';
  const isPremiumLocked = mentor.isPremium && userPlan !== 'premium';
  const intro = MENTOR_INTROS[mentor.id];
  const accentColor = isCoach ? 'from-primary to-accent' : 'from-secondary to-primary';

  return (
    <>
      <div className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isPremiumLocked
          ? 'border-amber-200/60 hover:border-amber-300/80 hover:shadow-amber-100'
          : 'border-border hover:border-primary/30 hover:shadow-primary/8'
      }`}>
        {/* Avatar — tam genişlik, üstte */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {isImageUrl(mentor.avatar) ? (
            <Image
              src={mentor.avatar}
              alt={mentor.title}
              fill
              className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isPremiumLocked ? 'brightness-90' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">
              {mentor.avatar}
            </div>
          )}

          {/* Kategori etiketi */}
          <div className="absolute left-3 top-3">
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${
              isCoach ? 'bg-primary' : 'bg-secondary'
            }`}>
              {isCoach ? 'AI Koç' : 'AI Mentor'}
            </span>
          </div>

          {/* Premium rozeti */}
          {mentor.isPremium && (
            <div className="absolute right-3 top-3">
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg"
                style={{ background: 'linear-gradient(135deg, #92400e, #d97706, #fbbf24)', color: '#fff' }}>
                <Crown className="h-3 w-3" />
                Premium
              </div>
            </div>
          )}

          {/* Kilit overlay */}
          {isPremiumLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-black/10 to-transparent">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300/60 bg-amber-500/20 backdrop-blur-sm">
                <Lock className="h-6 w-6 text-amber-200" />
              </div>
            </div>
          )}

          {/* Beni Tanı butonu — avatar üzerinde, altta */}
          {intro && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => setShowIntro(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/40 bg-black/50 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65 transition-colors"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
                Beni Tanı
              </button>
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-1.5 text-lg font-bold text-foreground">{mentor.title}</h3>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{mentor.description}</p>

          {/* Uzmanlık etiketleri */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {mentor.expertise.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 3 && (
              <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                +{mentor.expertise.length - 3}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {intro && (
              <button
                onClick={() => setShowIntro(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/4 transition-colors"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
                Beni Tanı
              </button>
            )}

            {isPremiumLocked ? (
              <Link href="/pricing" className="flex-1">
                <Button className="w-full gap-2 border border-amber-300/60 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100 font-medium" variant="outline">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Premium'a Geç
                </Button>
              </Link>
            ) : (
              <Link href={`/chat/${mentor.id}`} className="flex-1">
                <Button className="w-full gap-2 bg-primary text-white shadow-sm hover:bg-primary/90 font-medium">
                  <MessageCircle className="h-4 w-4" />
                  Sohbete Başla
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tanıtım Modalı */}
      {showIntro && intro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowIntro(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className={`relative bg-gradient-to-br ${accentColor} px-7 pt-8 pb-10`}>
              <button
                onClick={() => setShowIntro(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Avatar küçük */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-white/30 shadow-lg">
                  {isImageUrl(mentor.avatar) ? (
                    <Image src={mentor.avatar} alt={mentor.title} fill className="object-cover object-top" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl bg-white/10">{mentor.avatar}</div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{mentor.name}</p>
                  <h3 className="text-xl font-bold text-white leading-tight">{mentor.title}</h3>
                </div>
              </div>

              <h2 className="text-base font-bold text-white leading-snug">{intro.headline}</h2>
            </div>

            {/* Alıntı kartı — header ile body arasında */}
            <div className="-mt-5 mx-6">
              <div className="rounded-2xl border border-border bg-white px-5 py-4 shadow-md">
                <Quote className="mb-2 h-5 w-5 text-primary/40" />
                <p className="text-sm font-medium leading-relaxed text-foreground italic">
                  "{intro.quote}"
                </p>
                <p className="mt-2 text-xs font-semibold text-primary">— {intro.author}</p>
              </div>
            </div>

            {/* Gövde */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-sm leading-relaxed text-muted-foreground">{intro.body}</p>
            </div>

            {/* Konular */}
            <div className="px-6 pb-5">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Seninle çalışacağımız konular
              </p>
              <ul className="space-y-1.5">
                {intro.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2.5 text-sm text-foreground">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accentColor}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="px-6 pb-7">
              {isPremiumLocked ? (
                <Link href="/pricing" onClick={() => setShowIntro(false)}>
                  <Button className="w-full gap-2 border border-amber-300/60 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold" variant="outline" size="lg">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Premium'a Geç — Bu Koça Eriş
                  </Button>
                </Link>
              ) : (
                <Link href={`/chat/${mentor.id}`} onClick={() => setShowIntro(false)}>
                  <Button className={`w-full gap-2 bg-gradient-to-r ${accentColor} text-white hover:opacity-90 font-semibold shadow-lg`} size="lg">
                    <MessageCircle className="h-4 w-4" />
                    {intro.cta}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
