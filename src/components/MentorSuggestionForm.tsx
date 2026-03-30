'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface MentorSuggestionFormProps {
  isLoggedIn: boolean;
  userEmail?: string;
  userName?: string;
}

export function MentorSuggestionForm({ isLoggedIn, userEmail, userName }: MentorSuggestionFormProps) {
  const [type, setType] = useState<'coach' | 'mentor'>('coach');
  const [field, setField] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setStatus('error');
      setErrorMessage('Öneri göndermek için giriş yapmanız gerekmektedir.');
      return;
    }

    if (!field.trim()) {
      setStatus('error');
      setErrorMessage('Lütfen uzmanlık alanı belirtin.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/mentor-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          field: field.trim(),
          description: description.trim(),
          userEmail,
          userName,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setField('');
        setDescription('');
      } else {
        const data = await response.json();
        setStatus('error');
        setErrorMessage(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 mb-8">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-8 md:p-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Koç / Mentor Öner</h2>
            <p className="text-sm text-muted-foreground mt-1">
              İhtiyacın olan bir uzmanlık alanında koç veya mentor görmek ister misin? Önerinizi bize iletin!
            </p>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Öneri göndermek için <a href="/auth/login" className="font-medium underline">giriş yapmanız</a> gerekmektedir.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Koç / Mentor Seçimi */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ne tür bir uzman öneriyorsunuz?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('coach')}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  type === 'coach'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white text-muted-foreground hover:border-primary/30'
                }`}
              >
                <span className="block font-semibold">AI Koç</span>
                <span className="text-xs opacity-70">Soru sorarak farkındalık yaratır</span>
              </button>
              <button
                type="button"
                onClick={() => setType('mentor')}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  type === 'mentor'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-border bg-white text-muted-foreground hover:border-secondary/30'
                }`}
              >
                <span className="block font-semibold">AI Mentor</span>
                <span className="text-xs opacity-70">Deneyim ve bilgi paylaşır</span>
              </button>
            </div>
          </div>

          {/* Uzmanlık Alanı */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Uzmanlık Alanı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="Örn: Satış, Finans, Hukuk, İnsan Kaynakları, Sağlık..."
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={!isLoggedIn}
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ek Açıklama (İsteğe bağlı)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Bu alanda nasıl bir koç/mentor görmek istersiniz? Ne tür konularda yardım bekliyorsunuz?"
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              disabled={!isLoggedIn}
            />
          </div>

          {/* Durum Mesajları */}
          {status === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Öneriniz başarıyla gönderildi. Değerlendirmeye alacağız!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Gönder Butonu */}
          <Button
            type="submit"
            disabled={!isLoggedIn || isSubmitting}
            className="gap-2 bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Öneri Gönder
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
