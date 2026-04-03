import { Button } from '@/components/ui/button';
import { MentorCard } from '@/components/MentorCard';
import { DEFAULT_MENTORS } from '@/lib/types';
import { Sparkles, Zap, Target, ShieldCheck, ArrowRight, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FreeTrialBanner } from '@/components/FreeTrialBanner';
import { getCurrentUser } from '@/lib/auth';
import { CherryBlossom } from '@/components/CherryBlossom';
import { PackageCarousel } from '@/components/PackageCarousel';
import { UserDashboard } from '@/components/UserDashboard';
import { HeroRotatingText } from '@/components/HeroRotatingText';

export default async function HomePage() {
  const user = await getCurrentUser();
  const userPlan = user?.plan ?? null;
  const coaches = DEFAULT_MENTORS.filter((m) => m.category === 'coach');
  const mentors = DEFAULT_MENTORS.filter((m) => m.category === 'mentor');

  return (
    <div className="bg-white">
      {/* Free Trial Banner */}
      <FreeTrialBanner isLoggedIn={!!user} />

      {/* ── Kullanıcı Dashboard (Giriş yapmışsa) ──────────────────── */}
      {user && <UserDashboard />}

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Kiraz çiçeği animasyonu */}
        <CherryBlossom />

        {/* Subtle lila gradient arka plan */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
            {/* Sol: Metin */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Yapay Zeka Destekli Platform
              </div>

              <HeroRotatingText />

              <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Link href="/mentors">
                  <Button size="lg" className="gap-2 bg-primary px-8 text-base font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90">
                    Koç / Mentor Seç
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="gap-2 border-border px-8 text-base font-medium hover:bg-muted">
                    Planları Gör
                  </Button>
                </Link>
              </div>

              {/* Mini trust signals */}
              <div className="flex flex-col items-center gap-2.5 sm:flex-row lg:items-start">
                {['Uluslararası Koçluk Etik Standartları', 'Türkçe Destek', '1 Ücretsiz Seans'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ: Görsel */}
            <div className="flex flex-1 justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Ana görsel */}
                <div className="overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-border">
                  <Image
                    src="/login-coaching.png"
                    alt="Thorius AI Koçluk Seansı"
                    width={560}
                    height={420}
                    className="w-full object-cover"
                    priority
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15">
                    <Zap className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Anında Yanıt</p>
                    <p className="text-xs text-muted-foreground">7/24 erişim</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">GROW Modeli</p>
                    <p className="text-xs text-muted-foreground">Uluslararası Koçluk Standartları</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #4c0f8f 28%, #7c3aed 55%, #2563eb 80%, #0ea5e9 100%)',
      }}>
        {/* İnce desen */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        {/* Halo */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Zap,
                iconBg: 'bg-sky-400/20 text-sky-200',
                title: 'Anında Yanıt',
                desc: '7/24 erişilebilir AI koç ve mentorlar ile bekleme süresi olmadan profesyonel rehberlik alın.',
              },
              {
                icon: Target,
                iconBg: 'bg-violet-400/20 text-violet-200',
                title: 'GROW Modeli',
                desc: 'Uluslararası koçluk standartlarında GROW metodolojisi ile hedeflerinizi netleştirin ve eyleme geçin.',
              },
              {
                icon: ShieldCheck,
                iconBg: 'bg-indigo-400/20 text-indigo-200',
                title: 'Etik Standartlar',
                desc: 'Tüm koç ve mentorlar Uluslararası Koçluk yüksek etik standartlarına göre yapılandırılmıştır. Gizlilik güvence altında.',
              },
            ].map(({ icon: Icon, iconBg, title, desc }) => (
              <div key={title} className="flex gap-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/65">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Koçlar ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            AI Koçlar
          </span>
          <h2 className="mb-3 text-3xl font-bold text-foreground">Koçlarımızla Tanışın</h2>
          <p className="max-w-xl text-muted-foreground">
            Uluslararası Koçluk etik standartlarında eğitilmiş, GROW metodolojisiyle çalışan AI koçlar
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
          ))}
        </div>
      </section>

      {/* ── Mentorlar ───────────────────────────────────────────────── */}
      <section className="bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-3 inline-block rounded-full border border-secondary/25 bg-secondary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              AI Mentorlar
            </span>
            <h2 className="mb-3 text-3xl font-bold text-foreground">Mentorlarımızla Tanışın</h2>
            <p className="max-w-xl text-muted-foreground">
              Sektör deneyimini doğrudan paylaşan, somut öneriler sunan AI mentorlar
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Neden Thorius ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex-1">
            <span className="mb-4 inline-block rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Neden Thorius?
            </span>
            <h2 className="mb-6 text-3xl font-bold leading-tight text-foreground">
              Gelişiminizi sistematik ve ölçülebilir yapın
            </h2>
            <div className="space-y-5">
              {[
                { title: 'Kişiye özel seans deneyimi', desc: 'Her koç ve mentor, sizin ihtiyaçlarınıza göre adapte olur.' },
                { title: 'Ödev ve takip sistemi', desc: 'Her seans sonunda somut eylem adımları ve ödev takibi.' },
                { title: 'Gelişim raporları', desc: 'Tüm seanslarınızın analizi ile kişisel gelişim grafiğinizi görün.' },
                { title: 'Gizlilik güvencesi', desc: 'Seans içerikleri üçüncü şahıslarla paylaşılmaz, verileriniz güvende.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-600 text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl shadow-xl shadow-secondary/10 ring-1 ring-border">
              <Image
                src="/login-hero.png"
                alt="Verimli Çalışma Anı"
                width={560}
                height={420}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>Uluslararası Koçluk Etik Standartları</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="font-medium text-foreground">6 Uzman AI Koç & Mentor</span>
            <div className="h-4 w-px bg-border" />
            <span>Türkçe Koçluk & Mentorluk</span>
            <div className="h-4 w-px bg-border" />
            <span>GROW Metodolojisi</span>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-12 text-center sm:p-16">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
          />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Gelişim yolculuğunuz bugün başlıyor
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80">
              {user
                ? 'Koçunuzu seçin ve gelişim yolculuğunuza devam edin.'
                : 'İlk seansınız ücretsiz. Kayıt olun, koçunuzu seçin ve kariyer hedefinize doğru ilk adımı atın.'}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {user ? (
                <Link href="/mentors">
                  <Button size="lg" className="gap-2 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90 shadow-lg">
                    Koçunu Seç
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="gap-2 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90 shadow-lg">
                      Ücretsiz Başla
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/mentors">
                    <Button size="lg" variant="outline" className="border-white/30 bg-white/10 px-8 text-base font-medium text-white hover:bg-white/25">
                      Koçları Keşfet
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma - Carousel */}
      <PackageCarousel />

      <div className="pb-10 text-center">
        <Link href="/pricing">
          <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
            Tüm plan detaylarını gör
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="font-bold text-foreground">Thorius</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Thorius AI Koçluk Platformu. Tüm hakları saklıdır.
            </p>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground/70">
              Platform içerikleri, AI koç/mentor kişilikleri ve seans yapıları 5846 Sayılı Fikir ve Sanat Eserleri Kanunu kapsamında Thorius'un münhasır fikri mülkiyetidir.
              Seans içerikleri gizlidir; izinsiz kopyalanamaz, çoğaltılamaz ve hiçbir mecrada paylaşılamaz.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span>Anthropic ile desteklenmektedir</span>
              <span>·</span>
              <span>Uluslararası Koçluk Etik Standartları</span>
              <span>·</span>
              <span>KVKK Uyumlu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
