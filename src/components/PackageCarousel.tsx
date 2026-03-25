'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  icon: string;
  title: string;
  description: string;
}

interface Package {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  Icon: React.ElementType;
  slides: Slide[];
}

const PACKAGES: Package[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    Icon: Sparkles,
    slides: [
      {
        icon: '🎯',
        title: 'Risksiz Tanışma',
        description: 'AI koçluğu ücretsiz dene, karar sonra ver.',
      },
      {
        icon: '💡',
        title: 'Gerçek Seans Deneyimi',
        description: 'Demo değil, tam teşekküllü bir koçluk seansı.',
      },
      {
        icon: '🚀',
        title: 'Hemen Başla',
        description: 'Kayıt ol, koçunu seç, ilk seansını yap.',
      },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    Icon: Zap,
    slides: [
      {
        icon: '📅',
        title: 'Düzenli Gelişim Alışkanlığı',
        description: '10 seansla tutarlı bir gelişim rutini oluştur.',
      },
      {
        icon: '🎧',
        title: 'Sesli Rehberlik',
        description: 'Kritik anlarda koçun sesiyle motive ol.',
      },
      {
        icon: '📊',
        title: 'İlerlemenizi Görün',
        description: 'Gelişim raporlarıyla nerede olduğunuzu bilin.',
      },
      {
        icon: '✅',
        title: 'Somut Adımlar',
        description: 'Her seans sonunda eylem planı ve ödevler.',
      },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    Icon: Crown,
    slides: [
      {
        icon: '🗣️',
        title: 'Gerçek Konuşma Deneyimi',
        description: 'Tam sesli AI — sanki karşında biri var.',
      },
      {
        icon: '👑',
        title: 'Tüm Uzmanlar Emrinde',
        description: 'Premium dahil tüm koç ve mentorlara erişim.',
      },
      {
        icon: '🎯',
        title: 'Kişisel Dönüşüm Planı',
        description: 'Sana özel tasarlanmış gelişim yol haritası.',
      },
      {
        icon: '📈',
        title: 'Haftalık İlerleme Takibi',
        description: 'Düzenli raporlarla motivasyonunu yüksek tut.',
      },
      {
        icon: '🔥',
        title: '30 Seansla Kalıcı Değişim',
        description: 'Yeterli süre ile gerçek ve kalıcı dönüşüm.',
      },
    ],
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    Icon: Building2,
    slides: [
      {
        icon: '👥',
        title: 'Ekip Gelişimi',
        description: 'Tüm ekibinizi aynı platformda geliştirin.',
      },
      {
        icon: '📊',
        title: 'Yönetici Paneli',
        description: 'Ekip performansını tek yerden takip edin.',
      },
      {
        icon: '🎯',
        title: 'Kurumsal Hedef Uyumu',
        description: 'Bireysel gelişimi şirket hedeflerine bağlayın.',
      },
      {
        icon: '⚡',
        title: 'Öncelikli Destek',
        description: 'Sorularınıza hızlı ve öncelikli yanıt.',
      },
    ],
  },
];

function PackageSlider({ pkg }: { pkg: Package }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pkg.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pkg.slides.length) % pkg.slides.length);
  };

  const Icon = pkg.Icon;

  return (
    <div className={`relative rounded-2xl border ${pkg.borderColor} ${pkg.bgColor} p-6 h-full`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          pkg.id === 'free' ? 'bg-gradient-to-br from-slate-500 to-slate-700' :
          pkg.id === 'starter' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
          pkg.id === 'premium' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
          'bg-gradient-to-br from-emerald-600 to-teal-700'
        }`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className={`text-lg font-bold ${pkg.color}`}>{pkg.name}</h3>
        {pkg.id === 'premium' && (
          <span className="ml-auto rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
            En Popüler
          </span>
        )}
      </div>

      {/* Slide Content */}
      <div ref={containerRef} className="relative overflow-hidden min-h-[120px]">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {pkg.slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 px-1">
              <div className="text-3xl mb-2">{slide.icon}</div>
              <h4 className="font-semibold text-foreground mb-1">{slide.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{slide.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1">
          {pkg.slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide
                  ? `w-4 ${pkg.id === 'premium' ? 'bg-amber-500' : pkg.id === 'starter' ? 'bg-blue-500' : pkg.id === 'kurumsal' ? 'bg-emerald-500' : 'bg-slate-500'}`
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PackageCarousel() {
  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Paketleri Keşfet
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Her Paket{' '}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              Nasıl Fayda Sağlar?
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Sadece özellik değil, gerçek dönüşüm. Her paketin size nasıl değer katacağını keşfedin.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg) => (
            <PackageSlider key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
