'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, Sparkles, Zap, BarChart3, Crown, Building2,
  MessageSquare, Volume2, VolumeX, Users, ChevronDown, Plus, Lock, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/* ── WooCommerce ödeme URL'leri ────────────────────────────────────────── */
const WC_URLS: Record<string, string> = {
  starter:  process.env.NEXT_PUBLIC_WC_STARTER_URL  ?? '',
  pro:      process.env.NEXT_PUBLIC_WC_PRO_URL       ?? '',
  premium:  process.env.NEXT_PUBLIC_WC_PREMIUM_URL  ?? '',
  kurumsal: process.env.NEXT_PUBLIC_WC_KURUMSAL_URL ?? '',
  seans5:   process.env.NEXT_PUBLIC_WC_SEANS5_URL   ?? '',
  seans10:  process.env.NEXT_PUBLIC_WC_SEANS10_URL  ?? '',
};

/* ── Plan hiyerarşisi (aşağı geçiş engellenir) ───────────────────────────── */
const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  premium: 3,
  kurumsal: 4,
};

/* ── Plan tanımları ────────────────────────────────────────────────────── */
type PlanId = 'free' | 'starter' | 'premium' | 'kurumsal';

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
    priceUsd: '40',
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
    priceUsd: '200',
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
    priceUsd: '650',
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
    cta: 'Bize Ulaşın',
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
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    sessions: '',
    description: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Kullanıcının mevcut planını al
  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.user?.plan ?? 'free');
        }
      } catch {
        // Kullanıcı giriş yapmamış
      }
    }
    fetchUserPlan();
  }, []);

  // Aşağı plana geçiş kontrolü
  function canUpgradeTo(targetPlan: PlanId): boolean {
    if (!userPlan) return true; // Giriş yapmamış kullanıcılar her planı seçebilir
    const currentLevel = PLAN_HIERARCHY[userPlan] ?? 0;
    const targetLevel = PLAN_HIERARCHY[targetPlan] ?? 0;
    return targetLevel > currentLevel; // Sadece yukarı geçiş mümkün
  }

  // Mevcut plan kontrolü
  function isCurrentPlan(planId: PlanId): boolean {
    return userPlan === planId;
  }

  async function handleEnterpriseFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    console.log('[Enterprise Form] Submitting:', formData);

    try {
      const res = await fetch('/api/enterprise-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('[Enterprise Form] Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('[Enterprise Form] Success response:', data);
        setFormSuccess(true);
        setTimeout(() => {
          setShowEnterpriseForm(false);
          setFormSuccess(false);
          setFormData({
            name: '',
            email: '',
            company: '',
            sessions: '',
            description: '',
          });
        }, 2000);
      } else {
        const data = await res.json();
        console.error('[Enterprise Form] Error response:', data);
        setError(data.error ?? 'Form gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('[Enterprise Form] Request failed:', err);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSelectPlan(planId: PlanId) {
    // Mevcut plan kontrolü
    if (isCurrentPlan(planId)) {
      return;
    }

    // Aşağı geçiş kontrolü
    if (!canUpgradeTo(planId) && planId !== 'free') {
      setError('Mevcut planınızdan daha düşük bir plana geçiş yapamazsınız.');
      return;
    }

    if (planId === 'free') {
      router.push('/mentors');
      return;
    }
    if (planId === 'kurumsal') {
      setShowEnterpriseForm(true);
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
            İlk seansı ücretsiz dene. Paket biter, yenisi alınır — abonelik yok.
          </p>
        </div>

        {/* Plan Kartları */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  {plan.price === '0' ? (
                    <span className="text-3xl font-bold">Ücretsiz</span>
                  ) : plan.id === 'kurumsal' ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold text-primary">Bize Ulaşın</span>
                      <span className="text-xs text-muted-foreground">Özel fiyatlandırma</span>
                    </div>
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
                {isCurrentPlan(plan.id) ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full text-sm border-green-500 text-green-600 bg-green-50"
                    size="sm"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mevcut Planınız
                  </Button>
                ) : !canUpgradeTo(plan.id) && plan.id !== 'free' ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full text-sm opacity-50 cursor-not-allowed"
                    size="sm"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Geçiş Yapılamaz
                  </Button>
                ) : (
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
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Ek Seans Paketleri */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
              <Plus className="h-3.5 w-3.5" /> Ek Seans
            </div>
            <h3 className="text-lg font-semibold">Mevcut paketine seans ekle</h3>
            <p className="mt-1 text-sm text-muted-foreground">Planını değiştirmeden seanslarını artır. Bitince tekrar alabilirsin.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto">
            <div className="flex flex-col rounded-xl border border-border bg-background p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <p className="font-bold text-lg">5 Ek Seans</p>
              <p className="mt-0.5 text-xs text-muted-foreground mb-3">₺400 / seans</p>
              <div className="mb-4">
                <span className="text-2xl font-bold">₺2.000</span>
              </div>
              <ul className="mb-4 space-y-1 text-xs">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Mevcut planın korunur</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Anında hesabına eklenir</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-auto"
                onClick={() => { const url = WC_URLS['seans5']; if (url) window.location.href = url; }}
              >
                5 Seans Al
              </Button>
            </div>
            <div className="flex flex-col rounded-xl border border-primary/30 bg-background p-5 ring-1 ring-primary/20">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-lg">10 Ek Seans</p>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">₺500 tasarruf</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground mb-3">₺350 / seans</p>
              <div className="mb-4">
                <span className="text-2xl font-bold">₺3.500</span>
              </div>
              <ul className="mb-4 space-y-1 text-xs">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Mevcut planın korunur</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Anında hesabına eklenir</li>
              </ul>
              <Button
                size="sm"
                className="w-full mt-auto"
                onClick={() => { const url = WC_URLS['seans10']; if (url) window.location.href = url; }}
              >
                10 Seans Al
              </Button>
            </div>
          </div>
        </div>

        {/* Ses Modeli Açıklaması */}
        <div className="mt-12 rounded-2xl border border-border/40 bg-muted/20 p-6">
          <h3 className="mb-4 text-center text-lg font-semibold">Ses Modeli Nedir?</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <VolumeX className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Sessiz</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Tüm yanıtlar yalnızca yazılı. Ses desteği yok.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Karma Ses</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Koç, kritik anlarda sesli konuşur — açılış, kapanış ve önemli mesajlar. Ücretsiz ve Starter'da geçerli.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-background p-4">
              <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium">FULL Sesli</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Her yanıt uygun karakterler ile seslendirilir. Gerçek bir koçla konuşma deneyimi.
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
                    { label: 'Seans Paketi',      vals: ['1', '10', '30', '100'] },
                    { label: 'Soru / Seans',      vals: ['10', '10', '10', '10'] },
                    { label: 'Koç & Mentor',      vals: ['Seçili', 'Seçili', 'Tümü', 'Tümü'] },
                    { label: 'Premium Koç',       vals: ['✗', '✗', '✓', '✓'] },
                    { label: 'Ses Modeli',        vals: ['Karma', 'Karma', 'FULL', 'FULL'] },
                    { label: 'Seans Özetleri',    vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Gelişim Raporları', vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Öncelikli Destek',  vals: ['✗', '✗', '✗', '✓'] },
                    { label: 'Paket Fiyatı',      vals: ['Ücretsiz', '₺1.990', '₺14.900', 'Bize Ulaşın'] },
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

      {/* Kurumsal Plan İletişim Formu */}
      <Dialog open={showEnterpriseForm} onOpenChange={setShowEnterpriseForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Kurumsal Plan Talebi
            </DialogTitle>
            <DialogDescription>
              Kurumsal paketimiz hakkında bilgi almak için formu doldurun. En kısa sürede size dönüş yapacağız.
            </DialogDescription>
          </DialogHeader>

          {formSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-green-600">Talebiniz başarıyla gönderildi!</p>
              <p className="mt-1 text-sm text-muted-foreground">En kısa sürede size dönüş yapacağız.</p>
            </div>
          ) : (
            <form onSubmit={handleEnterpriseFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  placeholder="Ad Soyad"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Şirket Adı</Label>
                <Input
                  id="company"
                  placeholder="Şirket adınız"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessions">Planlanan Seans Sayısı *</Label>
                <Input
                  id="sessions"
                  type="number"
                  min="1"
                  placeholder="Örn: 50"
                  value={formData.sessions}
                  onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">İhtiyaç Açıklaması *</Label>
                <Textarea
                  id="description"
                  placeholder="Kurumsal koçluk ihtiyacınızı kısaca açıklayın..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEnterpriseForm(false)}
                  disabled={formLoading}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 gap-2"
                >
                  {formLoading ? (
                    'Gönderiliyor...'
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Gönder
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
