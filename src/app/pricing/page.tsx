'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Sparkles, Zap, BarChart3, Crown, Building2,
  MessageSquare, Volume2, VolumeX, Users, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── WooCommerce ödeme URL'leri ────────────────────────────────────────── */
const WC_URLS: Record<string, string> = {
  starter:  process.env.NEXT_PUBLIC_WC_STARTER_URL  ?? '',
  pro:      process.env.NEXT_PUBLIC_WC_PRO_URL       ?? '',
  premium:  process.env.NEXT_PUBLIC_WC_PREMIUM_URL  ?? '',
  kurumsal: process.env.NEXT_PUBLIC_WC_KURUMSAL_URL ?? '',
};

/* ── Plan tanımları ────────────────────────────────────────────────────── */
type PlanId = 'free' | 'starter' | 'pro' | 'premium' | 'kurumsal';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceUsd: string;
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
    priceUsd: '0',
    badge: null,
    description: 'Thorius\'u keşfetmek için tek seans dene',
    icon: Sparkles,
    gradient: 'from-slate-500 to-slate-700',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    sessions: 1,
    ttsMode: 'none',
    mentors: 'secili',
    features: [
      '1 koçluk / mentorluk seansı',
      'Seans başına 10 soru',
      'Seçili AI koç ve mentorlar',
      'Seans özeti ve ödev',
    ],
    notFeatures: ['Sesli yanıt', 'Premium koç ve mentorlar'],
    cta: 'Ücretsiz Başla',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '1.990',
    priceUsd: '40',
    badge: null,
    description: 'Gelişim yolculuğuna düzenli başlamak için',
    icon: Zap,
    gradient: 'from-blue-500 to-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50/40',
    sessions: 10,
    ttsMode: 'karma',
    mentors: 'secili',
    features: [
      '10 seans / ay',
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
    id: 'pro',
    name: 'Pro',
    price: '3.490',
    priceUsd: '70',
    badge: null,
    description: 'Sistematik büyüme için daha fazla seans',
    icon: BarChart3,
    gradient: 'from-violet-500 to-violet-700',
    border: 'border-violet-200',
    bg: 'bg-violet-50/40',
    sessions: 20,
    ttsMode: 'karma',
    mentors: 'secili',
    features: [
      '20 seans / ay',
      'Seans başına 10 soru',
      'Seçili AI koç ve mentorlar',
      'Karma ses — koç kritik anlarda konuşur',
      'Seans özetleri ve ödevler',
      'Gelişim raporları',
    ],
    notFeatures: ['Premium koç ve mentorlar', 'Tam sesli deneyim'],
    cta: 'Pro\'ya Geç',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '5.990',
    priceUsd: '120',
    badge: 'En Popüler',
    description: 'Tam sesli koçluk — sanki biriyle konuşuyorsun',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-300',
    bg: 'bg-amber-50/40',
    sessions: 30,
    ttsMode: 'full',
    mentors: 'tum',
    features: [
      '30 seans / ay',
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
    price: '29.990',
    priceUsd: '600',
    badge: null,
    description: 'Ekibiniz için kurumsal koçluk platformu',
    icon: Building2,
    gradient: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/40',
    sessions: 100,
    ttsMode: 'full',
    mentors: 'tum',
    features: [
      '100 seans / ay',
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

/* ── Ana bileşen ────────────────────────────────────────────────────────── */
export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

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
    setError(null);

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

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) {
        router.push('/mentors');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Bir hata oluştu.');
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Başlık */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Şeffaf Fiyatlandırma
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Gelişiminize{' '}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              yatırım yapın
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Uluslararası koçluk standartlarında AI koç ve mentorlarla sistematik gelişim.
            İlk seansı ücretsiz dene.
          </p>
        </div>

        {/* Plan Kartları */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;
            const isHighlighted = plan.id === 'premium';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border ${plan.border} ${plan.bg} p-6 transition-all duration-200 ${
                  isHighlighted
                    ? 'shadow-lg ring-2 ring-amber-400/40'
                    : 'hover:shadow-md'
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
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">{plan.description}</p>
                </div>

                {/* Fiyat */}
                <div className="mb-4">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">
                      {plan.price === '0' ? 'Ücretsiz' : `₺${plan.price}`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="mb-0.5 text-sm text-muted-foreground">/ay</span>
                    )}
                  </div>
                  {plan.priceUsd !== '0' && (
                    <p className="text-xs text-muted-foreground">${plan.priceUsd} USD</p>
                  )}
                </div>

                {/* Seans + Mentorlar + TTS */}
                <div className="mb-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-sm font-semibold">{plan.sessions}</span>
                    <span className="text-xs text-muted-foreground">seans/ay</span>
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
                  className={`w-full text-sm ${
                    isHighlighted
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 border-0`
                      : ''
                  }`}
                  size="sm"
                >
                  {isLoading ? 'İşleniyor...' : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Ses Modeli Açıklaması */}
        <div className="mt-12 rounded-2xl border border-border/40 bg-muted/20 p-6">
          <h3 className="mb-4 text-center text-lg font-semibold">Ses Modeli Nedir?</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <VolumeX className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Sessiz</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tüm yanıtlar yalnızca yazılı. Ücretsiz planda geçerli.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Karma Ses</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Koç, ilk ve son mesajda sesli konuşur. Ortadaki sorular yazılı yanıt alır.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium">FULL Sesli</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Her yanıt ElevenLabs ile seslendirilir. Gerçek bir koçla konuşma hissi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Karşılaştırma Tablosu — açılır/kapanır */}
        <div className="mt-10">
          <button
            onClick={() => setShowTable(!showTable)}
            className="mx-auto flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showTable ? 'rotate-180' : ''}`} />
            Detaylı plan karşılaştırmasını {showTable ? 'gizle' : 'göster'}
          </button>

          {showTable && (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="w-40 p-4 text-left font-medium text-muted-foreground">Özellik</th>
                    {PLANS.map((p) => (
                      <th key={p.id} className="p-4 text-center font-semibold">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[
                    { label: 'Aylık Seans',      vals: ['1', '10', '20', '30', '100'] },
                    { label: 'Soru / Seans',      vals: ['10', '10', '10', '10', '10'] },
                    { label: 'Koç & Mentor',      vals: ['Seçili', 'Seçili', 'Seçili', 'Tümü', 'Tümü'] },
                    { label: 'Premium Koç',       vals: ['✗', '✗', '✗', '✓', '✓'] },
                    { label: 'Ses Modeli',        vals: ['Sessiz', 'Karma', 'Karma', 'FULL', 'FULL'] },
                    { label: 'Seans Özetleri',    vals: ['✓', '✓', '✓', '✓', '✓'] },
                    { label: 'Gelişim Raporları', vals: ['✓', '✓', '✓', '✓', '✓'] },
                    { label: 'Öncelikli Destek',  vals: ['✗', '✗', '✗', '✗', '✓'] },
                    { label: 'Fiyat / ay',        vals: ['Ücretsiz', '₺1.990', '₺3.490', '₺5.990', '₺29.990'] },
                  ].map((row) => (
                    <tr key={row.label} className="transition-colors hover:bg-muted/10">
                      <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                      {row.vals.map((v, i) => (
                        <td
                          key={i}
                          className={`p-4 text-center font-medium ${
                            v === '✓'      ? 'text-green-600' :
                            v === '✗'      ? 'text-muted-foreground/40' :
                            v === 'FULL'   ? 'font-semibold text-amber-600' : ''
                          }`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
