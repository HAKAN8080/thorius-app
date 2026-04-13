'use client';

import { useState } from 'react';
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
import { Calendar, Clock, Users, Video, Check, Mail, Sparkles, Heart } from 'lucide-react';
import Image from 'next/image';

interface ExpertCoach {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  expertise: string[];
  experience: string;
  approach: string;
  availability: string;
}

const EXPERT_COACHES: ExpertCoach[] = [
  {
    id: 'ayse-yilmaz',
    name: 'Ayşe Yılmaz',
    title: 'ICF PCC Sertifikalı Koç',
    avatar: '/avatars/expert-1.jpg',
    bio: '12 yıllık kurumsal deneyim ve 500+ koçluk seansı',
    expertise: ['Liderlik Geliştirme', 'Kariyer Geçişi', 'Ekip Yönetimi'],
    experience: '500+ seans | Fortune 500 deneyimi',
    approach: 'GROW metodolojisi ile sistematik gelişim odaklı koçluk',
    availability: 'Hafta içi akşam ve hafta sonu',
  },
  {
    id: 'mehmet-kaya',
    name: 'Mehmet Kaya',
    title: 'Girişimcilik & Kariyer Koçu',
    avatar: '/avatars/expert-2.jpg',
    bio: 'Startup kurucusu, 300+ girişimciye mentorluk',
    expertise: ['Girişimcilik', 'İş Geliştirme', 'Strateji'],
    experience: '300+ girişimci ile çalıştı',
    approach: 'Pratik odaklı, lean metodoloji ile hızlı sonuç',
    availability: 'Hafta içi gündüz',
  },
  {
    id: 'zeynep-demir',
    name: 'Zeynep Demir',
    title: 'Yaşam & İş Dengesi Koçu',
    avatar: '/avatars/expert-3.jpg',
    bio: 'Psikolog, 8 yıl kurumsal koçluk deneyimi',
    expertise: ['İş-Yaşam Dengesi', 'Stres Yönetimi', 'Mindfulness'],
    experience: '400+ kişiye koçluk',
    approach: 'Farkındalık temelli, bütünsel yaklaşım',
    availability: 'Esnek, online toplantı',
  },
];

export default function ExpertCoachingPage() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<ExpertCoach | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coachId: '',
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
        body: JSON.stringify({
          ...formData,
          coachName: selectedCoach?.name,
        }),
      });

      if (res.ok) {
        setFormSuccess(true);
        setTimeout(() => {
          setShowContactForm(false);
          setFormSuccess(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            coachId: '',
            message: '',
          });
          setSelectedCoach(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const openContactForm = (coach: ExpertCoach) => {
    setSelectedCoach(coach);
    setFormData((prev) => ({ ...prev, coachId: coach.id }));
    setShowContactForm(true);
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
                Uzman Koçluk
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

            {/* 1:1 Uzman Koçluk */}
            <div className="rounded-2xl border-2 border-primary bg-white p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold">1:1 Uzman Koçluk</h3>
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

      {/* Uzman Koçlar */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Uzman Koçlarımız</h2>
            <p className="text-muted-foreground">
              Sertifikalı, deneyimli koçlar. Size en uygun olanını seçin.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {EXPERT_COACHES.map((coach) => (
              <div
                key={coach.id}
                className="group rounded-2xl border border-border bg-white p-6 transition-all hover:shadow-lg"
              >
                {/* Avatar */}
                <div className="mb-4 flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-bold text-primary">
                      {coach.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{coach.name}</h3>
                    <p className="text-sm text-muted-foreground">{coach.title}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="mb-4 text-sm text-muted-foreground">{coach.bio}</p>

                {/* Uzmanlık */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Uzmanlık
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {coach.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deneyim */}
                <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{coach.experience}</span>
                </div>

                {/* Yaklaşım */}
                <p className="mb-6 text-xs italic text-muted-foreground">
                  &quot;{coach.approach}&quot;
                </p>

                {/* CTA */}
                <Button
                  onClick={() => openContactForm(coach)}
                  className="w-full"
                  variant="outline"
                >
                  İletişime Geç
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İletişim Formu Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCoach ? `${selectedCoach.name} ile İletişime Geç` : 'İletişim'}
            </DialogTitle>
            <DialogDescription>
              Bilgilerinizi bırakın, en kısa sürede size dönüş yapalım.
            </DialogDescription>
          </DialogHeader>

          {formSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-green-600">Talebiniz alındı!</p>
              <p className="mt-1 text-sm text-muted-foreground">En kısa sürede size ulaşacağız.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Ad Soyad *</Label>
                <Input
                  id="contact-name"
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
                  rows={4}
                  placeholder="Koçluktan beklentilerinizi kısaca paylaşın..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                  disabled={formLoading}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" disabled={formLoading} className="flex-1 gap-2">
                  {formLoading ? 'Gönderiliyor...' : (
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
