'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Users, Video, Check, Mail, Sparkles, Heart } from 'lucide-react';

export default function ExpertCoachingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/expert-coaching-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormSuccess(true);
        setTimeout(() => {
          setFormSuccess(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Heart className="h-4 w-4" />
              Daha Derin Bağ İçin
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              1:1 Online{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Koçluk / Mentorluk
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Sertifikalı, deneyimli koçlarla kişiye özel eşleştirme.
              Online toplantılarla esnek ve derinlemesine koçluk deneyimi.
            </p>

            {/* Öne Çıkan Özellikler */}
            <div className="mx-auto mb-12 grid max-w-3xl gap-4 sm:grid-cols-3">
              {[
                { icon: Users, text: 'Kişiye Özel Eşleştirme' },
                { icon: Video, text: 'Online Video Seanslar' },
                { icon: Calendar, text: 'Esnek Randevu Sistemi' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-white/60 px-4 py-3 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Koçluk ile Karşılaştırma - Dengeli */}
      <section className="border-y border-border/50 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl mb-4">
              Size En Uygun Koçluğu Seçin
            </h2>
            <p className="text-muted-foreground">
              Her iki model de etkili - seçim sizin ihtiyacınıza göre
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {/* AI Koçluk */}
            <div className="rounded-2xl border border-border bg-white p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold">AI Koçluk</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Sistematik, 7/24 erişilebilir gelişim
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  '7/24 erişim',
                  'Anında başlama',
                  'Ölçülebilir gelişim takibi',
                  'Uygun fiyat',
                  'GROW metodolojisi',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 1:1 Koçluk / Mentorluk */}
            <div className="rounded-2xl border-2 border-primary bg-white p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold">1:1 Koçluk / Mentorluk</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Daha derin bağ, sezgisel anlayış
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Kişiye özel uzman eşleştirme',
                  'Online video seanslar',
                  'Derin bağ ve sezgisel anlayış',
                  'Esnek randevu sistemi',
                  'Uzun vadeli yol arkadaşlığı',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* İletişim Formu */}
      <section className="py-20 bg-muted/20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">İletişime Geçin</h2>
            <p className="text-muted-foreground">
              Uzman koçlarımızla tanışmak ve seans planlamak için formu doldurun.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-8 shadow-lg">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Ad Soyad *</Label>
                <Input
                  id="contact-name"
                  placeholder="Adınız Soyadınız"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">E-posta *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Telefon</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Mesajınız</Label>
                <Textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  placeholder="1:1 koçluk hakkında beklentilerinizi, hangi alanlarda destek almak istediğinizi kısaca paylaşın..."
                />
              </div>

              {formSuccess && (
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600">Talebiniz alındı!</p>
                  <p className="text-sm text-green-600/80">En kısa sürede size ulaşacağız.</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={formLoading || formSuccess}
                className="w-full gap-2"
                size="lg"
              >
                {formLoading ? 'Gönderiliyor...' : formSuccess ? 'Gönderildi!' : (
                  <>
                    <Mail className="h-4 w-4" />
                    Gönder
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
