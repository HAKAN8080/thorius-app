'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-white to-muted/30 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">E-posta Gönderildi</h1>
          <p className="mb-6 text-muted-foreground">
            Şifre sıfırlama linki <strong>{email}</strong> adresine gönderildi.
            Lütfen e-postanızı kontrol edin ve linke tıklayın.
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            E-posta gelmedi mi? Spam klasörünüzü kontrol edin veya birkaç dakika bekleyin.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-white to-muted/30 px-4">
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
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Şifremi Unuttum</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              E-posta
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
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
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sıfırlama Linki Gönder'}
          </Button>
        </form>
      </div>
    </div>
  );
}
