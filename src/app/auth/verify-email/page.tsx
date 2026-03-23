'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Mail, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');
  const pending = searchParams.get('pending') === 'true';
  const email = searchParams.get('email');

  // Başarılı doğrulama
  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">E-posta Doğrulandı!</h1>
        <p className="mb-6 text-muted-foreground">
          Hesabınız başarıyla aktive edildi. Artık giriş yaparak AI koç ve mentorlarımızla görüşmeye başlayabilirsiniz.
        </p>
        <Link href="/auth/login">
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            Giriş Yap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Bekleyen doğrulama (yeni kayıt sonrası)
  if (pending) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">E-postanızı Doğrulayın</h1>
        <p className="mb-6 text-muted-foreground">
          <strong>{email}</strong> adresine bir doğrulama linki gönderdik.
          Lütfen e-postanızı kontrol edin ve linke tıklayarak hesabınızı aktive edin.
        </p>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
          <p className="text-sm text-amber-700">
            <strong>E-posta gelmediyse:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-600">
            <li>• Spam/Gereksiz klasörünüzü kontrol edin</li>
            <li>• Birkaç dakika bekleyin</li>
            <li>• E-posta adresinizi doğru yazdığınızdan emin olun</li>
          </ul>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Sorun devam ederse{' '}
          <a href="mailto:destek@thorius.com.tr" className="font-medium text-primary hover:underline">
            destek@thorius.com.tr
          </a>{' '}
          adresine yazın.
        </p>
      </div>
    );
  }

  // Hata durumları
  if (error) {
    const errorMessages: Record<string, { title: string; message: string }> = {
      invalid: {
        title: 'Geçersiz Link',
        message: 'Bu doğrulama linki geçersiz. Lütfen e-postanızdaki linki kontrol edin veya yeni kayıt olun.',
      },
      expired: {
        title: 'Süre Dolmuş',
        message: 'Bu doğrulama linkinin süresi dolmuş. Lütfen yeni bir kayıt oluşturun.',
      },
    };

    const errorInfo = errorMessages[error] || errorMessages.invalid;

    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">{errorInfo.title}</h1>
        <p className="mb-6 text-muted-foreground">{errorInfo.message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/register">
            <Button className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto">
              Yeni Kayıt Ol
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full sm:w-auto">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Varsayılan - bilgi sayfası
  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">E-posta Doğrulama</h1>
      <p className="mb-6 text-muted-foreground">
        Hesabınızı kullanabilmek için e-posta adresinizi doğrulamanız gerekmektedir.
      </p>
      <Link href="/auth/login">
        <Button variant="outline">Giriş Sayfasına Dön</Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-white to-muted/30 px-4 py-12">
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
