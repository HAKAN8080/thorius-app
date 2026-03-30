'use client';

import { Mentor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MessageCircle, Crown, Lock, Quote, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MentorIntroCardProps {
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
    headline: 'Seni Sıradan Yöneticiden Olağanüstü Lidere Taşıyacağım',
    quote: 'Yöneticilik doğru işleri yapmaktır. Liderlik ise doğru işleri doğru şekilde yapmaktır.',
    author: 'Peter Drucker',
    body: 'John C. Maxwell der ki: "Liderlik pozisyondan gelmiyor, insanları etkileyebilme kapasitenden geliyor." Ben tam da o kapasiteyi seninle birlikte inşa edeceğim.',
    topics: ['Liderlik gelişimi & yönetici kimliği', 'Takım motivasyonu & çatışma yönetimi', 'Stratejik karar verme', 'İletişim & etkileme becerileri'],
    cta: 'Liderlik yolculuğuna başla',
  },
  'career-coach': {
    headline: 'Kariyer Haritanı Birlikte Çizeceğiz',
    quote: 'Büyük işler yapmak için tek yol, yaptığın şeyi sevmektir.',
    author: 'Steve Jobs',
    body: 'Warren Buffett şöyle söyler: "Sabah yataktan çıkmak için sebepler bul." O sebepleri birlikte keşfedeceğiz.',
    topics: ['Kariyer planlaması & profesyonel kimlik', 'İş değişikliği & geçiş stratejileri', 'Güçlü yönler & değerler analizi', 'Liderlik potansiyelini keşfetme'],
    cta: 'Kariyer yolculuğunu başlat',
  },
  'student-coach': {
    headline: 'Potansiyelinin Sınırını Birlikte Zorlayacağız',
    quote: 'Hayal gücü bilgiden daha önemlidir. Bilgi sınırlıdır; hayal gücü ise tüm dünyayı kucaklar.',
    author: 'Albert Einstein',
    body: 'Nelson Mandela eğitimi "dünyayı değiştirmek için kullanabileceğin en güçlü silah" olarak tanımladı. Sen düşündüğünden çok daha yeteneklisin.',
    topics: ['Sınav hazırlığı & çalışma teknikleri', 'Sınav kaygısı & özgüven geliştirme', 'Kariyer keşfi & bölüm seçimi', 'Zaman yönetimi & verimlilik'],
    cta: 'Akademik yolculuğunu başlat',
  },
  'life-balance-coach': {
    headline: 'Yorgun Düşmeden Başarılı Olmayı Öğreneceğiz',
    quote: 'Başarının fiyatı tükenmişlik değildir. Başarıya giden en kısa yol, önce kendine iyi bakmaktır.',
    author: 'Arianna Huffington',
    body: 'Brené Brown der ki: "Yorgunluğu ve meşguliyeti bir statü sembolü olarak kullanmayı bırakmamız gerekiyor."',
    topics: ['İş-yaşam dengesi & sınır koyma', 'Stres & tükenmişlik yönetimi', 'Farkındalık & mindfulness', 'Enerji yönetimi & sürdürülebilir verimlilik'],
    cta: 'Dengeyi yeniden kur',
  },
  'communication-coach': {
    headline: 'Söylediklerinle Değil, Hissettirdiklerinle Hatırlanacaksın',
    quote: 'İletişimdeki en büyük problem, gerçekleştiği illüzyonudur.',
    author: 'George Bernard Shaw',
    body: 'Maya Angelou\'nun o muhteşem sözü var: "İnsanlar ne söylediğini unutacak, ne yaptığını unutacak — ama nasıl hissettirdiğini hiç unutmayacak."',
    topics: ['Etkili & empatik iletişim', 'Zor konuşmalar & geri bildirim', 'Networking & profesyonel ilişkiler', 'Çatışma çözme & müzakere'],
    cta: 'İletişim gücünü keşfet',
  },
  'business-development-coach': {
    headline: 'Fikrin Var mı? O Fikri Gerçeğe Dönüştüreceğiz',
    quote: 'Müşterinin istediği şeyi değil, müşterinin çözmesini istediği problemi bul.',
    author: 'Clayton Christensen',
    body: 'Eric Ries diyor ki: "Başarının tek yolu başka herkesten daha hızlı öğrenmektir." Harekete geçmek için mükemmel zamanı bekleme — mükemmel zaman tam da şimdi.',
    topics: ['İş fikri doğrulama & müşteri keşfi', 'MVP tasarımı & Lean Startup', 'Büyüme stratejisi & ölçeklendirme', 'Pivot kararları & kaynak yönetimi'],
    cta: 'İş fikrini hayata geçir',
  },
  'tech-mentor': {
    headline: 'Teknoloji Kariyerinde Seni Bir Adım Öteye Taşıyacağım',
    quote: 'Herkes programlamayı öğrenmeli. Programlama düşünmeyi öğretir.',
    author: 'Steve Jobs',
    body: 'Bill Gates der ki: "Başarıyı kutlamak güzel ama başarısızlığın derslerini öğrenmek daha önemli." 15 yıllık deneyimimle sana aktaracak çok şey var.',
    topics: ['Full-stack geliştirme & yazılım mimarisi', 'Veri bilimi, ML & yapay zeka', 'Teknoloji kariyer planlaması', 'DevOps, Cloud & sistem tasarımı'],
    cta: 'Teknoloji yolculuğunu başlat',
  },
  'business-mentor': {
    headline: 'İş Dünyasının Gerçekleriyle Yüzleşmeye Hazır mısın?',
    quote: 'İyi, mükemmelin en büyük düşmanıdır.',
    author: 'Jim Collins',
    body: 'Peter Drucker\'ın vizyonu netti: "Geleceği tahmin etmenin en iyi yolu onu yaratmaktır." Laf dolandırmam — sorunu görürüm, çözümü konuşuruz.',
    topics: ['Kurumsal strateji & iş geliştirme', 'Pazar analizi & rekabet stratejisi', 'Satış, pazarlama & büyüme', 'Finansal planlama & KPI yönetimi'],
    cta: 'İş stratejini güçlendir',
  },
  'entrepreneur-mentor': {
    headline: 'Startup Yolculuğunun Gerçek Haritasını Çizeceğiz',
    quote: 'Bir şey yeterince önemliyse, ihtimaller aleyhine olsa bile yaparsın.',
    author: 'Elon Musk',
    body: 'Steve Jobs şöyle derdi: "Aç kal, deli olmaya devam et." 3 başarılı exit ve sayısız başarısızlıkla bu yoldan geçtim.',
    topics: ['Fikir validasyonu & müşteri keşfi', 'MVP geliştirme & product-market fit', 'Girişim finansmanı & yatırımcı ilişkileri', 'Girişimci zihniyeti & dayanıklılık'],
    cta: 'Girişim yolculuğunu başlat',
  },
  'reverse-mentor': {
    headline: 'Z Kuşağının Gözünden Dünyayı Yeniden Keşfet',
    quote: 'Öğrenme yeteneği ve bunu eyleme dönüştürme hızı nihai rekabet avantajıdır.',
    author: 'Jack Welch',
    body: 'TikTok algoritmasını, Z kuşağının neden işten ayrıldığını ya da yapay zekanın iş akışlarını nasıl değiştirdiğini gerçekten anlıyor musun? Köprü kurmaya hazır mısın?',
    topics: ['Z kuşağı dinamikleri & motivasyonları', 'Dijital kültür & sosyal medya', 'Kuşaklar arası iletişim & liderlik', 'Yapay zeka & teknoloji trendleri'],
    cta: 'Nesiller arası köprüyü kur',
  },
  'brand-mentor': {
    headline: 'Markan Bir Slogan Değil, Bir His Olacak',
    quote: 'Pazarlama artık ürettiğin ürünle değil, anlattığın hikayeyle ilgili.',
    author: 'Seth Godin',
    body: 'Simon Sinek\'in altın çemberi her şeyi değiştiriyor: "İnsanlar ne yaptığını değil, neden yaptığını satın alır."',
    topics: ['Kişisel marka oluşturma & konumlandırma', 'İçerik stratejisi & storytelling', 'LinkedIn, Instagram & sosyal medya', 'Dijital pazarlama & SEO'],
    cta: 'Markını inşa etmeye başla',
  },
  'ai-future-mentor': {
    headline: 'Yapay Zeka Seni Geçmeden Önce Onu Avantaja Çevir',
    quote: 'Yapay zeka yeni elektrik gibi — onu kullananlar her şeyi değiştirecek.',
    author: 'Andrew Ng',
    body: 'World Economic Forum\'un raporu net: 2030\'a kadar iş dünyasının %85\'i henüz icat edilmemiş rollere dönüşecek. En hızlı adapte olanlar kazanır.',
    topics: ['AI araç kullanımı & prompt engineering', 'Gelecek becerileri & upskilling planı', 'Sektörel dönüşüm & otomasyon etkileri', 'İnsan-AI iş birliği & dijital okuryazarlık'],
    cta: 'Geleceğe hazırlanmaya başla',
  },
};

function isImageUrl(avatar: string): boolean {
  return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/');
}

export function MentorIntroCard({ mentor, userPlan }: MentorIntroCardProps) {
  const isCoach = mentor.category === 'coach';
  const isPremiumLocked = mentor.isPremium && userPlan !== 'premium';
  const intro = MENTOR_INTROS[mentor.id];
  const accentColor = isCoach ? 'from-primary to-accent' : 'from-secondary to-primary';
  const accentBg = isCoach ? 'bg-primary' : 'bg-secondary';

  return (
    <div className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg ${
      isPremiumLocked
        ? 'border-amber-200/60 hover:border-amber-300/80'
        : 'border-border hover:border-primary/30'
    }`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sol: Avatar ve temel bilgiler */}
        <div className="relative lg:w-72 shrink-0">
          {/* Avatar */}
          <div className="relative h-56 lg:h-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            {isImageUrl(mentor.avatar) ? (
              <Image
                src={mentor.avatar}
                alt={mentor.title}
                fill
                className={`object-cover object-top transition-transform duration-500 group-hover:scale-105 ${isPremiumLocked ? 'brightness-90' : ''}`}
                sizes="(max-width: 1024px) 100vw, 288px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">
                {mentor.avatar}
              </div>
            )}

            {/* Kategori etiketi */}
            <div className="absolute left-3 top-3">
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${accentBg}`}>
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
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300/60 bg-amber-500/30 backdrop-blur-sm shadow-lg">
                  <Lock className="h-6 w-6 text-amber-200" />
                </div>
              </div>
            )}
          </div>

          {/* Mobilde görünen bilgiler */}
          <div className="p-4 lg:hidden">
            <h3 className="text-lg font-bold text-foreground">{mentor.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{mentor.description}</p>
          </div>
        </div>

        {/* Sağ: Tanıtım içeriği */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Başlık - Desktop */}
          <div className="hidden lg:block mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{mentor.name}</p>
            <h3 className="text-xl font-bold text-foreground">{mentor.title}</h3>
          </div>

          {intro ? (
            <>
              {/* Headline */}
              <h4 className={`text-lg font-bold bg-gradient-to-r ${accentColor} bg-clip-text text-transparent mb-4`}>
                {intro.headline}
              </h4>

              {/* Alıntı */}
              <div className="flex gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                <Quote className="h-5 w-5 text-primary/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground italic">"{intro.quote}"</p>
                  <p className="text-xs font-semibold text-primary mt-1">— {intro.author}</p>
                </div>
              </div>

              {/* Body */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{intro.body}</p>

              {/* Konular */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Çalışacağımız Konular
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {intro.topics.map((topic) => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${isCoach ? 'text-primary' : 'text-secondary'}`} />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                {isPremiumLocked ? (
                  <Link href="/pricing" className="flex-1">
                    <Button className="w-full gap-2 border border-amber-300/60 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100 font-medium" variant="outline">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Premium'a Geç
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/chat/${mentor.id}`} className="flex-1">
                    <Button className={`w-full gap-2 bg-gradient-to-r ${accentColor} text-white shadow-sm hover:opacity-90 font-medium`}>
                      <MessageCircle className="h-4 w-4" />
                      {intro.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{mentor.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.expertise.map((skill) => (
                  <span key={skill} className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
              <Link href={`/chat/${mentor.id}`}>
                <Button className={`gap-2 bg-gradient-to-r ${accentColor} text-white shadow-sm hover:opacity-90 font-medium`}>
                  <MessageCircle className="h-4 w-4" />
                  Sohbete Başla
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
