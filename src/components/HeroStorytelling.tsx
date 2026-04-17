'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

interface Story {
  id: string;
  scenario: string;
  sceneName: string;
  quote: string;
  description: string;
  userCount: number;
}

const stories: Story[] = [
  {
    id: 'interview',
    scenario: 'İş mülakatı öncesi',
    sceneName: 'Mülakat Öncesi Gece',
    quote: '"Yarın çok önemli. Hazır olduğumu biliyorum ama... ya bir şey ters giderse?"',
    description: 'Mülakat öncesi kaygıyı güce dönüştürün. AI koçunuz sizinle senaryolar üzerinde çalışıyor, güçlü yanlarınızı ortaya çıkarmanıza yardımcı oluyor.',
    userCount: 47,
  },
  {
    id: 'leadership',
    scenario: 'Liderlik gelişimi',
    sceneName: 'İlk Yönetici Toplantısı',
    quote: '"Ekip benden lider olmamı bekliyor. Ama ben sadece bir ekip üyesiydim dün..."',
    description: 'Liderlik yolculuğunuzda yanınızdayız. Ekip yönetimi, karar alma ve etki yaratma konularında profesyonel rehberlik alın.',
    userCount: 63,
  },
  {
    id: 'career-change',
    scenario: 'Kariyer değişimi',
    sceneName: 'Yeni Başlangıç',
    quote: '"10 yıllık kariyerimi geride bırakıyorum. Bu cesaret mi, yoksa delilik mi?"',
    description: 'Kariyer geçişinizi stratejik planlayın. Yeni sektörde nasıl başarılı olacağınızı, hangi becerileri geliştirmeniz gerektiğini keşfedin.',
    userCount: 38,
  },
  {
    id: 'decision-fatigue',
    scenario: 'Karar yorgunluğu',
    sceneName: 'Çok Seçenek, Az Zaman',
    quote: '"Her gün yüzlerce karar veriyorum. Hangisi doğru, hangisi yanlış?"',
    description: 'Karar verme süreçlerinizi netleştirin. Önceliklendirme, stratejik düşünme ve analitik yaklaşım geliştirin.',
    userCount: 72,
  },
  {
    id: 'first-manager',
    scenario: 'İlk yöneticilik',
    sceneName: 'Yeni Sorumluluk',
    quote: '"Dün arkadaşım olan kişiler bugün benim ekibim. İlişkiler nasıl değişecek?"',
    description: 'İlk yöneticilik deneyiminizi sağlam temellere oturtun. Ekip dinamikleri, geri bildirim verme ve motivasyon teknikleri öğrenin.',
    userCount: 55,
  },
];

export function HeroStorytelling() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Otomatik geçiş
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % stories.length);
      setIsAnimating(false);
    }, 300);
  };

  const handleScenarioClick = (index: number) => {
    if (index === activeIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const activeStory = stories[activeIndex];

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0a1628' }}
    >
      {/* Background Image - Blurred Coaching Session */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/login-coaching.png"
          alt=""
          fill
          className="object-cover opacity-[0.15]"
          style={{ filter: 'blur(40px)' }}
          priority
        />
      </div>

      {/* Dark gradient overlay for readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(15, 32, 56, 0.9) 50%, rgba(10, 22, 40, 0.95) 100%)',
        }}
      />

      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #c49e5a 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Golden glow effect */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(196, 158, 90, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: 'rgba(196, 158, 90, 0.2)', backgroundColor: 'rgba(196, 158, 90, 0.06)', color: '#c49e5a' }}>
            <Sparkles className="h-3.5 w-3.5" />
            Gerçek Senaryolar, Gerçek Çözümler
          </div>
          <h1 className="mb-4 font-serif text-4xl font-normal text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Kariyerinizin dönüm noktalarında
            <span className="block" style={{ color: '#c49e5a' }}>yanınızdayız</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg"
            style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Her profesyonelin yaşadığı anları anlıyoruz. Size özel AI koçluk desteğiyle hedeflerinize ulaşın.
          </p>
        </div>

        {/* Scenario Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => handleScenarioClick(index)}
              className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                backgroundColor: activeIndex === index ? '#c49e5a' : 'rgba(255, 255, 255, 0.05)',
                color: activeIndex === index ? '#0a1628' : '#e5e7eb',
                border: `1px solid ${activeIndex === index ? '#c49e5a' : 'rgba(196, 158, 90, 0.25)'}`,
              }}
            >
              {/* Hover shimmer */}
              {activeIndex !== index && (
                <div
                  className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(196, 158, 90, 0.1), transparent)',
                  }}
                />
              )}
              <span className="relative">{story.scenario}</span>
            </button>
          ))}
        </div>

        {/* Story Card */}
        <div className="mx-auto max-w-4xl">
          <div
            className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 sm:p-12 ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(196, 158, 90, 0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Glow effect in card */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(196, 158, 90, 0.1) 0%, transparent 70%)',
              }}
            />

            <div className="relative">
              {/* Scene name */}
              <p
                className="mb-3 text-sm font-medium uppercase tracking-widest"
                style={{ color: '#c49e5a', fontFamily: 'var(--font-dm-sans)' }}
              >
                {activeStory.sceneName}
              </p>

              {/* Quote */}
              <blockquote
                className="mb-6 font-serif text-2xl font-normal italic leading-relaxed text-white sm:text-3xl lg:text-4xl"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {activeStory.quote}
              </blockquote>

              {/* Description */}
              <p
                className="mb-6 text-base leading-relaxed text-gray-300 sm:text-lg"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {activeStory.description}
              </p>

              {/* User count info */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(196, 158, 90, 0.15)' }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: '#c49e5a' }} />
                </div>
                <p className="text-sm font-medium text-gray-400" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Şu ana dek <span style={{ color: '#c49e5a', fontWeight: 600 }}>{activeStory.userCount}</span> kişi bu senaryo için destek aldı
                </p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="mt-8 flex gap-2">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'rgba(196, 158, 90, 0.1)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      backgroundColor: '#c49e5a',
                      width: index === activeIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
