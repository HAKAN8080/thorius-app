'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Sparkles, Zap, Crown, Building2,
  MessageSquare, Volume2, VolumeX, Users, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── WooCommerce ödeme URL'leri ────────────────────────────────────────── */
const WC_URLS: Record<string, string> = {
  starter:  process.env.NEXT_PUBLIC_WC_STARTER_URL  ?? '',
  premium:  process.env.NEXT_PUBLIC_WC_PREMIUM_URL  ?? '',
  kurumsal: process.env.NEXT_PUBLIC_WC_KURUMSAL_URL ?? '',
};

/* ── Plan tanımları ────────────────────────────────────────────────────── */
type PlanId = 'free' | 'starter' | 'premium' | 'kurumsal';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  badge: string | null;
  description: string;
  icon: React.ElementType;
  gradient: string;
  border: string;
  bg: string;
  sessions: number;
  ttsMode: 'none' | 'karma' | 'full';
  mentors: 'secili' | 'tum';
  features: string[];
  notFeatures: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: '0',
    badge: 'Açılışa Özel',
    description: 'Thorius\'u keşfetmek için tek seans dene',
    icon: Sparkles,
    gradient: 'from-slate-500 to-slate-700',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    sessions: 1,
    ttsMode: 'karma',
    mentors: 'secili',
    features: [
      '1 koçluk / mentorluk seansı',
      'Seans başına 10 soru',
      'Seçili AI koç ve mentorlar',
      'Karma ses — koç kritik anlarda konuşur',
      'Seans özeti ve ödev',
    ],
    notFeatures: ['Premium koç ve mentorlar'],
    cta: 'Ücretsiz Başla',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '1.990',
    badge: null,
    description: '10 seanslık paket — bitince tekrar al',
    icon: Zap,
    gradient: 'from-blue-500 to-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50/40',
    sessions: 10,
    ttsMode: 'karma',
    mentors: 'secili',
    features: [
      '10 seans paketi',
      'Seans başına 10 soru',
      'Seçili AI koç ve mentorlar',
      'Karma ses — koç kritik anlarda konuşur',
      'Seans özetleri ve ödevler',
      'Gelişim raporları',
    ],
    notFeatures: ['Premium koç ve mentorlar', 'Tam sesli deneyim'],
    cta: 'Starter\'a Geç',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '14.900',
    badge: 'En Popüler',
    description: '30 seanslık paket — tam sesli koçluk deneyimi',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-300',
    bg: 'bg-amber-50/40',
    sessions: 30,
    ttsMode: 'full',
    mentors: 'tum',
    features: [
      '30 seans paketi',
      'Seans başına 10 soru',
      'TÜM koç ve mentorlar',
      'Premium koç ve mentorlar dahil',
      'FULL Sesli — her yanıt seslendirilir',
      'Seans özetleri ve ödevler',
      'Gelişim raporları',
    ],
    notFeatures: [],
    cta: 'Premium\'a Geç',
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    price: '49.000',
    badge: null,
    description: '100 seanslık paket — ekibiniz için kurumsal koçluk',
    icon: Building2,
    gradient: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/40',
    sessions: 100,
    ttsMode: 'full',
    mentors: 'tum',
    features: [
      '100 seans paketi',
      'Seans başına 10 soru',
      'TÜM koç ve mentorlar',
      'Premium koç ve mentorlar dahil',
      'FULL Sesli — her yanıt seslendirilir',
      'Seans özetleri ve ödevler',
      'Gelişim raporları',
      'Öncelikli destek',
    ],
    notFeatures: [],
    cta: 'Teklif Al',
  },
];

/* ── TTS rozeti ─────────────────────────────────────────────────────────── */
function TTSBadge({ mode }: { mode: Plan['ttsMode'] }) {
  if (mode === 'full') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        <Volume2 className="h-3 w-3" /> FULL Sesli
      </span>
    );
  }
  if (mode === 'karma') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        <Volume2 className="h-3 w-3" /> Karma Ses
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
      <VolumeX className="h-3 w-3" /> Sessiz
    </span>
  );
}

interface PackageCarouselProps {
  userPlan?: string | null;
}

// Premium veya üstü planlar - bu kullanıcılara satın alma gösterilmez
const TOP_TIER_PLANS = ['premium', 'kurumsal'];

export function PackageCarousel({ userPlan }: PackageCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  // Premium veya kurumsal kullanıcılara carousel gösterme
  if (userPlan && TOP_TIER_PLANS.includes(userPlan)) {
    return null;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PLANS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleSelectPlan(planId: PlanId) {
    if (planId === 'free') {
      router.push('/mentors');
      return;
    }
    if (planId === 'kurumsal') {
      window.location.href = 'mailto:info@thorius.com.tr?subject=Kurumsal Plan Talebi';
      return;
    }

    setLoading(planId);

    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    const wcUrl = WC_URLS[planId];
    if (wcUrl) {
      window.location.href = wcUrl;
      return;
    }

    router.push('/pricing');
    setLoading(null);
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Şeffaf Fiyatlandırma
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Gelişiminize{' '}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              yatırım yapın
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            İlk seansı ücretsiz dene. Paket biter, yenisi alınır — abonelik yok.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isLoading = loading === plan.id;
              const isHighlighted = plan.id === 'premium';

              return (
                <div key={plan.id} className="w-full flex-shrink-0 px-4">
                  <div
                    className={`relative mx-auto max-w-md flex flex-col rounded-2xl border ${plan.border} ${plan.bg} p-6 transition-all duration-200 ${
                      isHighlighted
                        ? 'shadow-lg ring-2 ring-amber-400/40'
                        : 'shadow-md'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className={`rounded-full bg-gradient-to-r ${plan.gradient} px-3 py-1 text-xs font-semibold text-white shadow`}>
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    {/* İkon + İsim */}
                    <div className="mb-4">
                      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Fiyat */}
                    <div className="mb-4">
                      {plan.price === '0' ? (
                        <span className="text-3xl font-bold">Ücretsiz</span>
                      ) : (
                        <>
                          <div className="flex items-end gap-1">
                            <span className="text-3xl font-bold">
                              ₺{Math.round(parseInt(plan.price.replace('.', '')) / plan.sessions)}
                            </span>
                            <span className="mb-0.5 text-sm text-muted-foreground">/ seans</span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            ₺{plan.price} paket
                          </div>
                        </>
                      )}
                    </div>

                    {/* Seans + Mentorlar + TTS */}
                    <div className="mb-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-sm font-semibold">{plan.sessions}</span>
                        <span className="text-xs text-muted-foreground">seans</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs font-medium">
                          {plan.mentors === 'tum' ? 'Tüm koç & mentorlar' : 'Seçili koç & mentorlar'}
                        </span>
                      </div>
                      <div className="px-1">
                        <TTSBadge mode={plan.ttsMode} />
                      </div>
                    </div>

                    {/* Özellikler */}
                    <ul className="mb-5 flex-1 space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.notFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground/50">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="line-through">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isLoading}
                      variant={isHighlighted ? 'default' : 'outline'}
                      className={`w-full gap-2 ${
                        isHighlighted
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 border-0`
                          : ''
                      }`}
                      size="sm"
                    >
                      {isLoading ? 'İşleniyor...' : plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {PLANS.map((pkg, idx) => (
              <button
                key={pkg.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
