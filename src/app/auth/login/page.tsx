'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BookOpen, CheckCircle2, BarChart3, ArrowLeft } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, text: 'Geçmiş görüşmelerinizin notları ve özetleri' },
  { icon: CheckCircle2, text: 'Kişisel ödev takip sistemi' },
  { icon: BarChart3, text: 'Gelişim raporunuz ve ilerleme analizi' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/mentors';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Giriş yapılamadı.'); return; }
      router.push(from);
      router.refresh();
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          E-posta
        </label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com" required autoComplete="email"
          className="h-11 border-border bg-white focus:border-primary/50 focus:ring-primary/20" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Şifre
          </label>
        </div>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" required autoComplete="current-password"
          className="h-11 border-border bg-white focus:border-primary/50 focus:ring-primary/20" />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit"
        className="w-full h-11 bg-primary text-white font-semibold text-base shadow-md shadow-primary/20 hover:bg-primary/90"
        disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Giriş Yap'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Hesabınız yok mu?{' '}
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          Ücretsiz kayıt olun
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white">

      {/* Sol panel — görseller + marka */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary to-accent">
        {/* Ana görsel — mentorluk seansı */}
        <div className="absolute inset-0">
          <Image
            src="/login-coaching.png"
            alt="AI Koçluk Seansı"
            fill
            className="object-cover opacity-30"
            sizes="52vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-accent/75 to-secondary/80" />
        </div>

        {/* İkinci görsel — köşe kartı */}
        <div className="absolute bottom-8 right-8 w-48 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/20">
          <Image
            src="/login-hero.png"
            alt="Verimli Çalışma"
            width={192}
            height={144}
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
              Tekrar<br />
              <span className="text-white/80">hoş geldiniz.</span>
            </h2>
            <p className="mb-10 max-w-xs text-base leading-relaxed text-white/65">
              Kaldığınız yerden devam edin. Geçmiş seanslarınız ve gelişim takibiniz sizi bekliyor.
            </p>

            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <Icon className="h-4.5 w-4.5 text-white" />
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
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-xs font-bold text-white">T</span>
            </div>
            <span className="text-lg font-bold text-foreground">Thorius</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Giriş Yap</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              AI koç ve mentorlarınızla görüşmeye devam edin
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

    </div>
  );
}
