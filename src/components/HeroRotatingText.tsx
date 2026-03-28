'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SLIDES = [
  {
    title: (
      <>
        Profesyonel
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> AI Koçluk </span>
        ve Mentorluk
      </>
    ),
    description:
      'Uluslararası Koçluk Standartlarında AI koç ve mentorlarla kariyer, liderlik ve kişisel gelişiminizi sistematik olarak yönetin. 7/24 erişim, gerçek seans deneyimi.',
  },
  {
    title: (
      <>
        Testlerini Yorumla,
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Geleceğine </span>
        Yatırım Yap
      </>
    ),
    description:
      'AI koç ve mentorların rehberliğinde kişilik, liderlik ve yetkinlik testlerini birlikte yorumla. Güçlü yönlerini keşfet, gelişim alanlarını belirle ve kariyerini bilinçli şekilde inşa et.',
  },
  {
    title: (
      <>
        Gelişimini
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Takip Et, </span>
        Kontrolü Al
      </>
    ),
    description:
      'Kullanıcı panelinle geçmiş seanslarına ulaş, ödevlerini takip et ve test sonuçlarını görüntüle. Tüm gelişim yolculuğun tek bir yerde.',
  },
];

export function HeroRotatingText() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="min-h-[180px] lg:min-h-[200px]">
      <h1
        className={cn(
          'mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl transition-opacity duration-400',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {slide.title}
      </h1>
      <p
        className={cn(
          'mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl transition-opacity duration-400',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {slide.description}
      </p>

      {/* Dot indicators */}
      <div className="mb-8 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 400); }}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-6 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/50'
            )}
            aria-label={`Slayt ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
