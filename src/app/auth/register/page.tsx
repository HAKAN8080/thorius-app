'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Shield, Target, Brain, Check, ArrowLeft } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, COACHING_SERVICE_AGREEMENT, AI_DISCLAIMER, KVKK_CONSENT, CONFIDENTIALITY_AND_IP } from '@/lib/agreements';

interface AgreementItem {
  key: 'agreedToTerms' | 'agreedToPrivacy' | 'agreedToCoachingService' | 'agreedToAiDisclaimer' | 'agreedToKvkk' | 'agreedToConfidentiality';
  title: string;
  content: string;
  required: string;
  highlight?: boolean;
  badge?: string;
}

const AGREEMENTS: AgreementItem[] = [
  { key: 'agreedToTerms', title: 'Kullanım Koşulları', content: TERMS_OF_SERVICE, required: 'Kullanım Koşullarını okudum ve kabul ediyorum.' },
  { key: 'agreedToPrivacy', title: 'Gizlilik Politikası', content: PRIVACY_POLICY, required: 'Gizlilik Politikasını okudum ve kabul ediyorum.' },
  { key: 'agreedToKvkk', title: 'KVKK Aydınlatma & Açık Rıza', content: KVKK_CONSENT, required: '6698 Sayılı KVKK kapsamında kişisel verilerimin işlenmesine açık rıza veriyorum.', badge: 'KVKK' },
  { key: 'agreedToConfidentiality', title: 'Gizlilik, Fikri Mülkiyet & Telif', content: CONFIDENTIALITY_AND_IP, required: 'Seans içeriklerinin gizliliğine ve Thorius\'un fikri mülkiyet haklarına saygı göstereceğimi kabul ediyorum.', highlight: true, badge: 'Yasal' },
  { key: 'agreedToCoachingService', title: 'Hizmet Sözleşmesi', content: COACHING_SERVICE_AGREEMENT, required: 'Hizmet Sözleşmesini okudum ve kabul ediyorum.' },
  { key: 'agreedToAiDisclaimer', title: 'Yapay Zeka Bildirimi', content: AI_DISCLAIMER, required: 'Yapay Zeka Sorumluluk Reddini okudum ve kabul ediyorum.', highlight: true },
];

const INTEREST_OPTIONS = [
  'Kariyer Gelişimi', 'Liderlik', 'Girişimcilik', 'Kişisel Gelişim',
  'Teknoloji', 'İş Stratejisi', 'Öğrenci Koçluğu', 'Yöneticilik',
];

const BENEFITS = [
  { icon: Brain, text: 'Kişiye özel AI koçluk seansları' },
  { icon: Target, text: 'GROW modeliyle hedef odaklı gelişim' },
  { icon: Shield, text: 'Yüksek etik standartlarla güvenli platform' },
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [agreed, setAgreed] = useState({
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToKvkk: false,
    agreedToConfidentiality: false,
    agreedToCoachingService: false,
    agreedToAiDisclaimer: false,
  });

  const totalAgreements = AGREEMENTS.length;
  const allAgreed = Object.values(agreed).every(Boolean);
  const agreedCount = Object.values(agreed).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!allAgreed) { setError('Devam etmek için tüm sözleşmeleri onaylamanız gerekmektedir.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company, jobTitle, interests, ...agreed }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Kayıt olunamadı.'); return; }
      router.push('/mentors');
      router.refresh();
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
                Gelişim<br />
                <span className="text-white/80">bugün başlıyor.</span>
              </h2>
              <p className="mb-10 max-w-xs text-base leading-relaxed text-white/65">
                AI koç ve mentorlarla kariyer, liderlik ve kişisel gelişiminizi sistematik olarak yönetin.
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
              <h1 className="text-2xl font-bold text-foreground">Hesap Oluştur</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Zaten hesabınız var mı?{' '}
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
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sözleşmeler <span className="text-destructive">*</span>
                  </p>
                  <span className={`text-xs font-medium tabular-nums ${agreedCount === totalAgreements ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {agreedCount}/{totalAgreements} onaylandı
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                    style={{ width: `${(agreedCount / totalAgreements) * 100}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {AGREEMENTS.map((agreement) => (
                    <div key={agreement.key}
                      className={`rounded-xl border overflow-hidden transition-colors ${
                        agreed[agreement.key]
                          ? 'border-green-500/30 bg-green-500/5'
                          : agreement.highlight
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-border/50 bg-card/30'
                      }`}>
                      <button type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                        onClick={() => setExpanded(expanded === agreement.key ? null : agreement.key)}>
                        <div className="flex items-center gap-2.5">
                          {agreed[agreement.key] ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : agreement.highlight ? (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                          ) : (
                            <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className="text-sm font-medium">{agreement.title}</span>
                          {agreement.badge && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary">
                              {agreement.badge}
                            </span>
                          )}
                        </div>
                        {expanded === agreement.key
                          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      </button>

                      {expanded === agreement.key && (
                        <div className="border-t border-border/40 px-4 pb-4 pt-3">
                          <div className="mb-3 max-h-40 overflow-y-auto rounded-lg bg-background/40 p-3">
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-foreground">
                              {agreement.content.trim()}
                            </pre>
                          </div>
                        </div>
                      )}

                      <label className="flex cursor-pointer items-center gap-3 px-4 pb-3 pt-0">
                        <input type="checkbox"
                          className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                          checked={agreed[agreement.key]}
                          onChange={(e) => setAgreed((prev) => ({ ...prev, [agreement.key]: e.target.checked }))} />
                        <span className="text-xs leading-tight text-muted-foreground">{agreement.required}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Tümünü Onayla */}
                <label className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                  allAgreed
                    ? 'border-green-500/40 bg-green-500/6'
                    : 'border-primary/30 bg-primary/4 hover:border-primary/50'
                }`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    checked={allAgreed}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setAgreed({
                        agreedToTerms: val,
                        agreedToPrivacy: val,
                        agreedToKvkk: val,
                        agreedToConfidentiality: val,
                        agreedToCoachingService: val,
                        agreedToAiDisclaimer: val,
                      });
                    }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Tümünü okudum ve kabul ediyorum
                  </span>
                  {allAgreed && (
                    <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-green-500" />
                  )}
                </label>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit"
                className="w-full h-11 bg-gradient-to-r from-secondary to-primary hover:opacity-90 font-semibold text-base disabled:opacity-40"
                disabled={loading || !allAgreed}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Hesabımı Oluştur'}
              </Button>
            </form>
          </div>
        </div>
    </div>
  );
}
