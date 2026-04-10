'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown, CheckCircle2, Shield, Target, Brain, Check, ArrowLeft } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, COACHING_SERVICE_AGREEMENT, AI_DISCLAIMER, KVKK_CONSENT, CONFIDENTIALITY_AND_IP } from '@/lib/agreements';

// Sözleşme içerikleri için map
const AGREEMENT_CONTENTS: Record<string, { title: string; content: string }> = {
  terms: { title: 'Kullanım Koşulları', content: TERMS_OF_SERVICE },
  privacy: { title: 'Gizlilik Politikası', content: PRIVACY_POLICY },
  kvkk: { title: 'KVKK Aydınlatma Metni', content: KVKK_CONSENT },
  confidentiality: { title: 'Gizlilik ve Fikri Mülkiyet', content: CONFIDENTIALITY_AND_IP },
  coaching: { title: 'Hizmet Sözleşmesi', content: COACHING_SERVICE_AGREEMENT },
  ai: { title: 'Yapay Zeka Bildirimi', content: AI_DISCLAIMER },
};

const INTEREST_OPTIONS = [
  'Kariyer Gelişimi', 'Liderlik', 'Girişimcilik', 'Kişisel Gelişim',
  'Teknoloji', 'İş Stratejisi', 'Öğrenci Koçluğu', 'Yöneticilik',
];

const BENEFITS = [
  { icon: Brain, text: 'Kişiye özel AI koçluk seansları' },
  { icon: Target, text: 'GROW metodolojisiyle hedef odaklı gelişim' },
  { icon: Shield, text: 'Gizli ve güvenli seans deneyimi' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewingAgreement, setViewingAgreement] = useState<string | null>(null);
  const [agreedToGeneral, setAgreedToGeneral] = useState(false);
  const [agreedToKvkk, setAgreedToKvkk] = useState(false);

  const allAgreed = agreedToGeneral && agreedToKvkk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!allAgreed) { setError('Devam etmek için tüm sözleşmeleri onaylamanız gerekmektedir.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, password, company, jobTitle, interests,
          agreedToTerms: agreedToGeneral,
          agreedToPrivacy: agreedToGeneral,
          agreedToCoachingService: agreedToGeneral,
          agreedToAiDisclaimer: agreedToGeneral,
          agreedToConfidentiality: agreedToGeneral,
          agreedToKvkk,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Kayıt olunamadı.'); return; }
      // Email doğrulama gerekiyorsa doğrulama sayfasına yönlendir
      if (data.requiresVerification) {
        router.push(`/auth/verify-email?pending=true&email=${encodeURIComponent(data.email)}`);
      } else {
        window.dispatchEvent(new Event('auth-change'));
        router.push('/mentors');
        router.refresh();
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">

        {/* Sol panel — görsel + marka */}
        <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-gradient-to-br from-secondary to-accent">
          {/* Arka plan görseli */}
          <div className="absolute inset-0">
            <Image
              src="/login-hero.png"
              alt="Gelişim Yolculuğu"
              fill
              className="object-cover opacity-25"
              sizes="44vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/88 via-accent/78 to-primary/82" />
          </div>

          {/* Köşe kartı — mentorluk görseli */}
          <div className="absolute bottom-8 right-8 w-44 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/20">
            <Image
              src="/login-coaching.png"
              alt="Mentorluk Seansı"
              width={176}
              height={132}
              className="w-full object-cover"
            />
          </div>

          {/* İçerik */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <Link href="/" className="mb-12 inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                <ArrowLeft className="h-4 w-4" />
                Ana Sayfaya Dön
              </Link>

              <h2 className="mb-4 text-4xl font-bold leading-tight">
                İlk Seans<br />
                <span className="text-white/80">Ücretsiz</span>
              </h2>
              <p className="mb-10 max-w-xs text-base leading-relaxed text-white/65">
                AI koçunuzu seçin ve ilk seansınızı hemen başlatın. Kredi kartı gerekmez.
              </p>

              <div className="space-y-4">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-white/80">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs leading-relaxed text-white/55">
                Tüm verileriniz gizli tutulur. Seans içerikleri üçüncü şahıslarla paylaşılmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Sağ panel — form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 overflow-y-auto">
          <div className="mx-auto w-full max-w-md">

            {/* Mobile logo */}
            <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="text-lg font-bold text-foreground">Thorius</span>
            </Link>

            {/* Başlık */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Ücretsiz Hesap Oluştur</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                İlk koçluk seansınız ücretsiz. Zaten hesabınız var mı?{' '}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Kişisel bilgiler */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Ad Soyad
                    </label>
                    <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız Soyadınız" required autoComplete="name"
                      className="h-11 border-border bg-white focus:border-primary/50" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      E-posta
                    </label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com" required autoComplete="email"
                      className="h-11 border-border bg-white focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Şifre <span className="normal-case font-normal">(en az 8 karakter)</span>
                  </label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={8} autoComplete="new-password"
                    className="h-11 border-border bg-white focus:border-primary/50" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Şirket <span className="normal-case font-normal text-muted-foreground/60">(opsiyonel)</span>
                    </label>
                    <Input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="Şirket adı"
                      className="h-11 border-border bg-white focus:border-primary/50" />
                  </div>
                  <div>
                    <label htmlFor="jobTitle" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Pozisyon <span className="normal-case font-normal text-muted-foreground/60">(opsiyonel)</span>
                    </label>
                    <Input id="jobTitle" type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Ünvanınız"
                      className="h-11 border-border bg-white focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    İlgi Alanları <span className="normal-case font-normal text-muted-foreground/60">(opsiyonel)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => {
                      const selected = interests.includes(opt);
                      return (
                        <button key={opt} type="button"
                          onClick={() => setInterests(selected ? interests.filter(i => i !== opt) : [...interests, opt])}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            selected
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border/60 bg-card/30 text-muted-foreground hover:border-primary/40'
                          }`}>
                          {selected && <Check className="h-3 w-3" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sözleşmeler */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sözleşmeler <span className="text-destructive">*</span>
                </p>

                {/* Genel Sözleşmeler */}
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${
                  agreedToGeneral
                    ? 'border-green-500/40 bg-green-500/5'
                    : 'border-border hover:border-primary/40'
                }`}>
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    checked={agreedToGeneral}
                    onChange={(e) => setAgreedToGeneral(e.target.checked)}
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    <button type="button" onClick={() => setViewingAgreement('terms')} className="text-primary hover:underline font-medium">Kullanım Koşulları</button>,{' '}
                    <button type="button" onClick={() => setViewingAgreement('privacy')} className="text-primary hover:underline font-medium">Gizlilik Politikası</button>,{' '}
                    <button type="button" onClick={() => setViewingAgreement('coaching')} className="text-primary hover:underline font-medium">Hizmet Sözleşmesi</button>,{' '}
                    <button type="button" onClick={() => setViewingAgreement('confidentiality')} className="text-primary hover:underline font-medium">Gizlilik ve Fikri Mülkiyet</button>{' '}ve{' '}
                    <button type="button" onClick={() => setViewingAgreement('ai')} className="text-primary hover:underline font-medium">Yapay Zeka Bildirimi</button>'ni okudum ve kabul ediyorum.
                  </span>
                  {agreedToGeneral && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />}
                </label>

                {/* KVKK Onayı */}
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${
                  agreedToKvkk
                    ? 'border-green-500/40 bg-green-500/5'
                    : 'border-border hover:border-primary/40'
                }`}>
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    checked={agreedToKvkk}
                    onChange={(e) => setAgreedToKvkk(e.target.checked)}
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    <button type="button" onClick={() => setViewingAgreement('kvkk')} className="text-primary hover:underline font-medium">KVKK Aydınlatma Metni</button>'ni okudum, kişisel verilerimin işlenmesine açık rıza veriyorum.
                  </span>
                  {agreedToKvkk && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />}
                </label>

                {/* Sözleşme Görüntüleme Modal */}
                {viewingAgreement && AGREEMENT_CONTENTS[viewingAgreement] && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-lg font-semibold">{AGREEMENT_CONTENTS[viewingAgreement].title}</h3>
                        <button
                          type="button"
                          onClick={() => setViewingAgreement(null)}
                          className="rounded-lg p-2 hover:bg-muted transition-colors"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                          {AGREEMENT_CONTENTS[viewingAgreement].content.trim()}
                        </pre>
                      </div>
                      <div className="border-t px-6 py-4">
                        <Button
                          type="button"
                          onClick={() => setViewingAgreement(null)}
                          className="w-full"
                        >
                          Kapat
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit"
                className="w-full h-11 bg-gradient-to-r from-secondary to-primary hover:opacity-90 font-semibold text-base disabled:opacity-40"
                disabled={loading || !allAgreed}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ücretsiz Başla'}
              </Button>
            </form>
          </div>
        </div>
    </div>
  );
}
