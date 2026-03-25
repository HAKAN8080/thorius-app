'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap, Crown, Building2, Check } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  Icon: React.ElementType;
  features: string[];
  highlight?: boolean;
}

const PACKAGES: Package[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 'Ücretsiz',
    description: 'AI koçluğu risksiz dene, karar sonra ver.',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    gradientFrom: 'from-slate-500',
    gradientTo: 'to-slate-700',
    Icon: Sparkles,
    features: [
      '1 koçluk seansı',
      'Gerçek seans deneyimi',
      'Seçili koç & mentorlar',
      'Seans özeti ve ödev',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₺1.990',
    description: 'Düzenli gelişim alışkanlığı oluştur.',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-700',
    Icon: Zap,
    features: [
      '10 seans paketi',
      'Karma ses — kritik anlarda sesli',
      'Seçili koç & mentorlar',
      'Gelişim raporları',
      'Seans özetleri ve ödevler',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₺19.000',
    description: 'Tam sesli koçluk — gerçek dönüşüm için.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    Icon: Crown,
    highlight: true,
    features: [
      '30 seans paketi',
      'FULL sesli — her yanıt sesli',
      'TÜM koç & mentorlar',
      'Premium mentorlar dahil',
      'Kişisel gelişim planı',
      'Haftalık raporlar',
    ],
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    price: '₺59.000',
    description: 'Ekibiniz için profesyonel koçluk çözümü.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-700',
    Icon: Building2,
    features: [
      '100 seans paketi',
      'FULL sesli deneyim',
      'TÜM koç & mentorlar',
      'Yönetici paneli',
      'Ekip gelişim raporları',
      'Öncelikli destek',
    ],
  },
];

export function PackageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PACKAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Paketleri Keşfet
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Size Uygun{' '}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              Paketi Seçin
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Her seviyeye uygun paketlerle gelişim yolculuğunuza başlayın.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {PACKAGES.map((pkg) => {
              const Icon = pkg.Icon;
              return (
                <div key={pkg.id} className="w-full flex-shrink-0 px-4">
                  <div
                    className={`mx-auto max-w-lg rounded-2xl border-2 ${pkg.borderColor} ${pkg.bgColor} p-8 ${
                      pkg.highlight ? 'ring-2 ring-amber-400/50 shadow-xl' : 'shadow-lg'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.highlight && (
                      <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white">
                        En Popüler
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${pkg.gradientFrom} ${pkg.gradientTo}`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold ${pkg.color}`}>{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">{pkg.price}</span>
                      {pkg.price !== 'Ücretsiz' && (
                        <span className="text-muted-foreground ml-1">/paket</span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${pkg.gradientFrom} ${pkg.gradientTo}`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {PACKAGES.map((pkg, idx) => (
              <div
                key={pkg.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
