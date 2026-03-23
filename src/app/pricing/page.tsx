'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Crown, Lock, BarChart3, MessageSquare, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WC_URLS: Record<string, string> = {
  essential: process.env.NEXT_PUBLIC_WC_ESSENTIAL_URL ?? '',
  premium: process.env.NEXT_PUBLIC_WC_PREMIUM_URL ?? '',
};

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    price: '999',
    currency: 'TL',
    badge: null,
    description: 'Gelişim yolculuğuna başlamak için ideal plan',
    icon: Zap,
    color: 'from-secondary to-accent',
    borderColor: 'border-secondary/30',
    bgColor: 'bg-secondary/5',
    sessions: 10,
    questionsPerSession: 10,
    features: [
      '10 koçluk / mentorluk seansı',
      'Her seansta 10 soru hakkı',
      'Seçili AI koç ve mentorlar',
      'Seans özetleri ve ödevler',
      'Gelişim raporlarını görüntüleme',
      'Seans geçmişi arşivi',
      'Ek paket satın alma imkânı',
    ],
    limitNote: 'Seans limitine ulaşıldığında ek paket satın alarak devam edebilirsiniz.',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '1499',
    currency: 'TL',
    badge: 'En Popüler',
    description: 'Sistematik gelişim için kapsamlı koçluk paketi',
    icon: Crown,
    color: 'from-primary to-accent',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/5',
    sessions: 30,
    questionsPerSession: 10,
    features: [
      '30 koçluk / mentorluk seansı',
      'Her seansta 10 soru hakkı',
      'Tüm AI koç ve mentorlar',
      'Seans özetleri ve ödevler',
      'Gelişim raporlarını görüntüleme',
      'Seans geçmişi arşivi',
      'Ek paket satın alma imkânı',
    ],
    limitNote: 'Seans limitine ulaşıldığında ek paket satın alarak devam edebilirsiniz.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectPlan(planId: string) {
    setLoading(planId);
    setError(null);

    // Check login first
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    // Redirect to WooCommerce product page for payment
    const wcUrl = WC_URLS[planId];
    if (wcUrl) {
      window.location.href = wcUrl;
      return;
    }

    // Fallback: direct plan activation (dev / no WC URL configured)
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
      {/* Subtle hero gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/6 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Şeffaf Fiyatlandırma
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Gelişiminize{' '}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              yatırım yapın
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Uluslararası Koçluk Standartlarında AI koç ve mentorlarla sistematik bir gelişim yolculuğu başlatın.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-8 backdrop-blur-sm transition-all duration-200 hover:border-opacity-60`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-white shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="mb-1 text-2xl font-bold">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-bold">₺{plan.price}</span>
                    <span className="mb-1 text-muted-foreground">KDV Dahil</span>
                  </div>
                </div>

                {/* Session Info */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
                    <MessageSquare className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-lg font-bold">{plan.sessions}</p>
                    <p className="text-xs text-muted-foreground">Seans</p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
                    <RefreshCcw className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-lg font-bold">{plan.questionsPerSession}</p>
                    <p className="text-xs text-muted-foreground">Soru / Seans</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limit Note */}
                <div className="mb-6 flex items-start gap-2 rounded-lg border border-border/40 bg-background/30 p-3">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{plan.limitNote}</p>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90 disabled:opacity-60`}
                  size="lg"
                >
                  {isLoading ? 'İşleniyor...' : `${plan.name} Planı Seç`}
                </Button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Compare Section */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Plan Karşılaştırması</h2>
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="p-4 text-left font-medium text-muted-foreground">Özellik</th>
                  <th className="p-4 text-center font-semibold">Essential</th>
                  <th className="p-4 text-center font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { label: 'Toplam Seans', essential: '10', premium: '30' },
                  { label: 'Soru / Seans', essential: '10', premium: '10' },
                  { label: 'Koç & Mentorlar', essential: 'Seçili', premium: 'Tümü' },
                  { label: 'Premium Koç & Mentor', essential: '✗', premium: '✓' },
                  { label: 'Seans Özetleri & Ödevler', essential: '✓', premium: '✓' },
                  { label: 'Gelişim Raporları', essential: '✓', premium: '✓' },
                  { label: 'Ek Paket Satın Alma', essential: '✓', premium: '✓' },
                  { label: 'Fiyat (KDV Dahil)', essential: '₺999', premium: '₺1.499' },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground">{row.label}</td>
                    <td className="p-4 text-center font-medium">{row.essential}</td>
                    <td className="p-4 text-center font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
