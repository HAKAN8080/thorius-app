'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Token veya email yoksa hata göster
  if (!token || !email) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Geçersiz Link</h1>
        <p className="mb-6 text-muted-foreground">
          Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
        </p>
        <Link href="/auth/forgot-password">
          <Button className="gap-2">
            Yeni Link İste
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Bir hata oluştu.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Şifreniz Güncellendi</h1>
        <p className="mb-6 text-muted-foreground">
          Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
        </p>
        <Link href="/auth/login">
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            Giriş Yap
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/auth/login"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Giriş sayfasına dön
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Yeni Şifre Belirle</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabınız için yeni bir şifre oluşturun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Yeni Şifre
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 border-border bg-white focus:border-primary/50 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">En az 8 karakter</p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Şifre Tekrar
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 border-border bg-white focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full bg-primary font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Şifremi Güncelle'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-white to-muted/30 px-4">
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
