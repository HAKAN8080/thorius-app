'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SlideAuthor {
  name: string;
  title: string;
  image: string;
}

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
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Uzman Eğitimli </span>
        AI Koç ve Mentorlar
      </>
    ),
    description:
      'Dr. Elif Uğur tarafından özenle eğitilmiş AI koç ve mentorlar. Sıradan yapay zeka yanıtları değil, profesyonel koçluk metodolojileri ve gerçek uzmanlıkla harmanlanan benzersiz bir deneyim.',
    author: {
      name: 'Dr. Elif Uğur',
      title: 'Kurucu & Eğitmen',
      image: '/avatars/elif.jpg',
    },
  },
  {
    title: (
      <>
        Testlerle
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Nerede Olduğunu </span>
        Gör
      </>
    ),
    description:
      'Kişilik, liderlik ve yetkinlik testleriyle potansiyelini ölç. Veriye dayalı içgörülerle güçlü yönlerini keşfet ve kariyer hedeflerine stratejik adımlar at.',
  },
  {
    title: (
      <>
        Akıllı Panel,
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Tam Kontrol </span>
      </>
    ),
    description:
      'AI destekli dashboard ile tüm gelişim verilerini tek ekranda izle. Seans analizleri, test sonuçları ve kişiselleştirilmiş öneriler parmaklarının ucunda.',
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
  const author = 'author' in slide ? slide.author as SlideAuthor : null;

  return (
    <div className="min-h-[220px] lg:min-h-[260px]">
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
          'mb-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl transition-opacity duration-400',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {slide.description}
      </p>

      {/* Author badge - sadece author varsa göster */}
      {author && (
        <div
          className={cn(
            'mb-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 px-4 py-2 transition-opacity duration-400',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/30">
            <Image
              src={author.image}
              alt={author.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{author.name}</p>
            <p className="text-xs text-muted-foreground">{author.title}</p>
          </div>
        </div>
      )}

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
