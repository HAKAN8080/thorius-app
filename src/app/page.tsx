import { Button } from '@/components/ui/button';
import { MentorCard } from '@/components/MentorCard';
import { DEFAULT_MENTORS } from '@/lib/types';
import { ArrowRight, CheckCircle, Brain, Compass, Users, Zap, Target, TrendingUp, Shield, Clock, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { UserDashboard } from '@/components/UserDashboard';

export default async function HomePage() {
  const user = await getCurrentUser();
  const userPlan = user?.plan ?? null;
  const coaches = DEFAULT_MENTORS.filter((m) => m.category === 'coach');
  const mentors = DEFAULT_MENTORS.filter((m) => m.category === 'mentor');

  return (
    <div className="bg-white">
      {/* ── Kullanıcı Dashboard (Giriş yapmışsa) ──────────────────── */}
      {user && <UserDashboard />}

      {/* ══════════════════════════════════════════════════════════════
          HERO - Sonuç Odaklı
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
            {/* Sol: Metin */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-sm font-medium text-primary">
                <Brain className="h-3.5 w-3.5" />
                Yapay Zeka Koçluk Platformu
              </div>

              {/* Ana Başlık */}
              <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Seni Her Gün Takip Eden AI Koçun
                </span>
              </h1>

              {/* Alt Başlık */}
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Hedeflerini belirle, yapay zeka koç ve mentorların seni
                her gün takip etsin. <span className="font-semibold text-foreground">Ödev versin, hatırlatsın, raporlasın.</span>
              </p>

              {/* Tek CTA */}
              <div className="mb-6">
                <Link href={user ? "/mentors" : "/auth/register"}>
                  <Button size="lg" className="gap-2 bg-primary px-10 py-6 text-lg font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    {user ? "Koçunu Seç" : "Ücretsiz Başla"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="mt-3 text-sm text-muted-foreground">
                  Kredi kartı gerekmez
                </p>
              </div>

              {/* Value Props */}
              <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-foreground">Günlük takip</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Kişisel ödevler
                </div>
                <div className="hidden sm:block h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  7/24 erişim
                </div>
              </div>
            </div>

            {/* Sağ: Görsel */}
            <div className="flex flex-1 justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-border">
                  <Image
                    src="/login-coaching.png"
                    alt="Yönetici Analizi"
                    width={560}
                    height={420}
                    className="w-full object-cover"
                    priority
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Karar Kalitesi</p>
                    <p className="text-xs text-muted-foreground">Ölçülebilir gelişim</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROBLEM ALANI
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
              Bu Durumlar Tanıdık Geliyor mu?
            </h2>
            <p className="text-muted-foreground">
              Üst düzey yöneticilerin karşılaştığı ortak zorluklar
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                title: 'Karar Yorgunluğu',
                desc: 'Günde onlarca karar vermek zihinsel enerjinizi tüketiyor. Kritik kararları erteliyor veya aceleci davranıyorsunuz.',
              },
              {
                icon: Compass,
                title: 'Öncelik Karmaşası',
                desc: 'Her şey acil görünüyor. Stratejik önemli ile operasyonel acil arasında kayboluyorsunuz.',
              },
              {
                icon: Users,
                title: 'Ekip Performansı',
                desc: 'Ekibinizden beklediğiniz sonuçları alamıyorsunuz. Motivasyon ve verimlilik düşük.',
              },
              {
                icon: Zap,
                title: 'Zihinsel Yük',
                desc: 'İş-yaşam dengesi kuramıyorsunuz. Sürekli "açık" olmak tükenmişliğe yol açıyor.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <Icon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ÇÖZÜM
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex-1">
            <span className="mb-4 inline-block rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Çözüm
            </span>
            <h2 className="mb-6 text-3xl font-bold leading-tight text-foreground">
              Kararlarınızın arkasındaki
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> kalıpları görün</span>
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Thorius, yapay zeka destekli analiz ile liderlik tarzınızı, karar verme kalıplarınızı ve
              kör noktalarınızı ortaya çıkarır. Genel tavsiyeler değil, size özel içgörüler sunar.
            </p>

            <div className="space-y-5">
              {[
                { title: 'Karar kalıplarınızı analiz eder', desc: 'Hangi durumlarda nasıl kararlar verdiğinizi görürsünüz.' },
                { title: 'Kişiye özel içgörüler sunar', desc: 'Jenerik değil, sizin verilerinize dayalı öneriler.' },
                { title: 'Netlik ve hız kazandırır', desc: 'Doğru kararları daha hızlı vermenizi sağlar.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl shadow-xl shadow-primary/10 ring-1 ring-border">
              <Image
                src="/login-hero.png"
                alt="Thorius Analiz"
                width={560}
                height={420}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          NASIL ÇALIŞIR
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #4c0f8f 28%, #7c3aed 55%, #2563eb 80%, #0ea5e9 100%)',
      }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Nasıl Çalışır?
            </h2>
            <p className="text-white/70">
              3 basit adımda liderlik içgörülerinize ulaşın
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Kısa Analiz',
                desc: '5 dakikalık liderlik analizi ile karar verme tarzınızı ve önceliklerinizi belirleyin.',
                icon: BarChart3,
              },
              {
                step: '2',
                title: 'AI Değerlendirme',
                desc: 'Yapay zeka yanıtlarınızı analiz eder, kalıpları ve kör noktaları tespit eder.',
                icon: Brain,
              },
              {
                step: '3',
                title: 'Aksiyon Önerileri',
                desc: 'Kişiselleştirilmiş rapor ve somut gelişim önerileri alın.',
                icon: Target,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAYDALAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Sonuçlar
          </span>
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Somut, Ölçülebilir Değişim
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: 'Daha Hızlı Karar',
              desc: 'Kararsızlık süresini azaltın, doğru kararları daha çabuk verin.',
              color: 'bg-amber-500/10 text-amber-600',
            },
            {
              icon: Target,
              title: 'Net Önceliklendirme',
              desc: 'Gerçekten önemli olana odaklanın, enerjinizi doğru yere harcayın.',
              color: 'bg-blue-500/10 text-blue-600',
            },
            {
              icon: TrendingUp,
              title: 'Güçlü Liderlik',
              desc: 'Ekibinizi daha etkili yönlendirin, güven ve motivasyon artışı görün.',
              color: 'bg-green-500/10 text-green-600',
            },
            {
              icon: Shield,
              title: 'Azalan Stres',
              desc: 'Zihinsel yükü hafifletin, iş-yaşam dengesini kurun.',
              color: 'bg-purple-500/10 text-purple-600',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-xl border border-border bg-white p-6 text-center transition-all hover:shadow-md">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PREMIUM KONUMLANDIRMA
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Bu Sıradan Bir Test Değil
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Thorius, üst düzey yöneticiler için özel olarak geliştirilmiş bir sistemdir.
            Uluslararası liderlik araştırmalarına dayanan metodoloji, yapay zeka destekli analiz
            ve profesyonel koçluk standartlarını bir araya getirir.
            <span className="font-medium text-foreground"> Amacımız sizi tanımlamak değil,
            potansiyelinizi ortaya çıkarmaktır.</span>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-12 text-center sm:p-16">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
          />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Hedeflerine Ulaşmanın Zamanı Geldi
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80">
              AI koçun seni her gün takip etsin, ödev versin, hatırlatsın.
              Taahhüt yok, kredi kartı yok.
            </p>
            <Link href={user ? "/mentors" : "/auth/register"}>
              <Button size="lg" className="gap-2 bg-white px-10 py-6 text-lg font-semibold text-primary hover:bg-white/90 shadow-lg">
                {user ? "Koçunu Seç" : "Ücretsiz Başla"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          KOÇLAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 bg-muted/10">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Analiz Sonrası
          </span>
          <h2 className="mb-3 text-3xl font-bold text-foreground">Derinlemesine Çalışmak İsterseniz</h2>
          <p className="max-w-2xl text-muted-foreground">
            Ücretsiz analiz sonrası, AI koçlarımızla birebir seanslarla devam edebilirsiniz.
            Uluslararası koçluk standartlarında, GROW metodolojisiyle çalışan profesyonel AI koçlar.
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
            <h2 className="mb-3 text-3xl font-bold text-foreground">Sektör Deneyimi</h2>
            <p className="max-w-xl text-muted-foreground">
              Somut iş deneyimini paylaşan, pratik öneriler sunan AI mentorlar
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SATIŞ GEÇİŞİ
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/50 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ücretsiz analiz sonrası detaylı liderlik raporu ve kişiselleştirilmiş koçluk teklifi alabilirsiniz.
            <br />
            <span className="text-foreground">Hiçbir taahhüt yok.</span> Sadece potansiyelinizi görün.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Image
                src="/thorius-logo.png"
                alt="Thorius"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span className="font-bold text-foreground">Thorius</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Thorius AI Koçluk Platformu. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">Hakkımızda</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Gizlilik</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">Kullanım Koşulları</Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
