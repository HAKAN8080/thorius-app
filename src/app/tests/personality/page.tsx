'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';

// Big Five Kategorileri
const CATEGORIES = [
  {
    id: 'extraversion',
    name: 'Disadonukluk',
    nameEn: 'Extraversion',
    color: '#FF6B6B',
    description: 'Sosyallik, enerjiklik ve olumlu duygular',
  },
  {
    id: 'agreeableness',
    name: 'Uyumluluk',
    nameEn: 'Agreeableness',
    color: '#4ECDC4',
    description: 'Isbirligi, guven ve empati',
  },
  {
    id: 'conscientiousness',
    name: 'Sorumluluk',
    nameEn: 'Conscientiousness',
    color: '#45B7D1',
    description: 'Oz-disiplin, duzenliliek ve basari odaklilik',
  },
  {
    id: 'neuroticism',
    name: 'Duygusal Denge',
    nameEn: 'Neuroticism (reversed)',
    color: '#96CEB4',
    description: 'Duygusal istikrar ve stres yonetimi',
  },
  {
    id: 'openness',
    name: 'Aciklik',
    nameEn: 'Openness',
    color: '#DDA0DD',
    description: 'Yaraticilik, merak ve yeni deneyimlere aciklik',
  },
];

// 50 Soru - Her kategoride 10 soru
const QUESTIONS: { id: number; text: string; category: string; reversed: boolean }[] = [
  // Disadonukluk (10 soru)
  { id: 1, text: 'Toplantilarda konusmayi ve fikirlerimi paylasmayi severim.', category: 'extraversion', reversed: false },
  { id: 2, text: 'Yeni insanlarla tanismak beni heyecanlandirir.', category: 'extraversion', reversed: false },
  { id: 3, text: 'Partilerde genellikle odanin ortasinda olurum.', category: 'extraversion', reversed: false },
  { id: 4, text: 'Yalniz kalmaktansa insanlarla birlikte olmayi tercih ederim.', category: 'extraversion', reversed: false },
  { id: 5, text: 'Grup aktivitelerinde liderlik rolunu ustlenirim.', category: 'extraversion', reversed: false },
  { id: 6, text: 'Sessiz ve sakin ortamlari tercih ederim.', category: 'extraversion', reversed: true },
  { id: 7, text: 'Konusmalarla baslatmaktan cekinmem.', category: 'extraversion', reversed: false },
  { id: 8, text: 'Sosyal etkinliklerden sonra kendimi enerjik hissederim.', category: 'extraversion', reversed: false },
  { id: 9, text: 'Dikkat cekmeyi severim.', category: 'extraversion', reversed: false },
  { id: 10, text: 'Taninmayan ortamlarda bile rahat hissederim.', category: 'extraversion', reversed: false },

  // Uyumluluk (10 soru)
  { id: 11, text: 'Baskalarina yardim etmek beni mutlu eder.', category: 'agreeableness', reversed: false },
  { id: 12, text: 'Insanlarin iyi niyetli olduguna inanirim.', category: 'agreeableness', reversed: false },
  { id: 13, text: 'Catisma yerine uzlasmayi tercih ederim.', category: 'agreeableness', reversed: false },
  { id: 14, text: 'Baskalarin duygularini kolayca anlarim.', category: 'agreeableness', reversed: false },
  { id: 15, text: 'Affetmekte zorlanmam.', category: 'agreeableness', reversed: false },
  { id: 16, text: 'Rekabetci olmaktansa isbirligi yapmayi tercih ederim.', category: 'agreeableness', reversed: false },
  { id: 17, text: 'Baskalarina karsi sabarliyimdir.', category: 'agreeableness', reversed: false },
  { id: 18, text: 'Kibar ve saygiliyimdir.', category: 'agreeableness', reversed: false },
  { id: 19, text: 'Baskalarinin ihtiyaclarini kendi ihtiyaclarimdan once dusunurum.', category: 'agreeableness', reversed: false },
  { id: 20, text: 'Elestiri yaparken yapici olmaya calisrim.', category: 'agreeableness', reversed: false },

  // Sorumluluk (10 soru)
  { id: 21, text: 'Islerimi zamaninda tamamlarim.', category: 'conscientiousness', reversed: false },
  { id: 22, text: 'Detaylara dikkat ederim.', category: 'conscientiousness', reversed: false },
  { id: 23, text: 'Her zaman hazirlikli olurum.', category: 'conscientiousness', reversed: false },
  { id: 24, text: 'Duzeni ve temizligi severim.', category: 'conscientiousness', reversed: false },
  { id: 25, text: 'Bir plan yapip ona uyarim.', category: 'conscientiousness', reversed: false },
  { id: 26, text: 'Hedeflerime ulasmak icin cok calisrim.', category: 'conscientiousness', reversed: false },
  { id: 27, text: 'Sorumluluklarimi ciddiye alirim.', category: 'conscientiousness', reversed: false },
  { id: 28, text: 'Isleri yarim birakmam.', category: 'conscientiousness', reversed: false },
  { id: 29, text: 'Kurallara ve prosedurleere uyarim.', category: 'conscientiousness', reversed: false },
  { id: 30, text: 'Kararliyim ve azimlliyimdir.', category: 'conscientiousness', reversed: false },

  // Duygusal Denge (10 soru) - Dusuk neuroticism = yuksek duygusal denge
  { id: 31, text: 'Stresli durumlarda sakin kalirim.', category: 'neuroticism', reversed: true },
  { id: 32, text: 'Duygularimi kontrol altinda tutabilirim.', category: 'neuroticism', reversed: true },
  { id: 33, text: 'Kolayca endiselenmem.', category: 'neuroticism', reversed: true },
  { id: 34, text: 'Kendime guvenirim.', category: 'neuroticism', reversed: true },
  { id: 35, text: 'Basarisizliklardan hizli toparlarim.', category: 'neuroticism', reversed: true },
  { id: 36, text: 'Ruh halim genellikle istikrarlidir.', category: 'neuroticism', reversed: true },
  { id: 37, text: 'Baskalarinin beni nasil gordugu konusunda rahatim.', category: 'neuroticism', reversed: true },
  { id: 38, text: 'Gelecek hakkinda iyimserim.', category: 'neuroticism', reversed: true },
  { id: 39, text: 'Zor zamanlarda bile umudumu kaybetmem.', category: 'neuroticism', reversed: true },
  { id: 40, text: 'Elestirilerden kolayca etkilenmem.', category: 'neuroticism', reversed: true },

  // Aciklik (10 soru)
  { id: 41, text: 'Yeni fikirler kesfetmeyi severim.', category: 'openness', reversed: false },
  { id: 42, text: 'Sanat ve guzellik beni derinden etkiler.', category: 'openness', reversed: false },
  { id: 43, text: 'Farkli kulturleri ve bakis acilarini anlamaya calisrim.', category: 'openness', reversed: false },
  { id: 44, text: 'Hayal gucum gucludur.', category: 'openness', reversed: false },
  { id: 45, text: 'Soyut kavramlar uzerinde dusunmekten zevk alirim.', category: 'openness', reversed: false },
  { id: 46, text: 'Rutin isler yerine yeni deneyimler tercih ederim.', category: 'openness', reversed: false },
  { id: 47, text: 'Yaratici cozumler bulmakta iyiyimdir.', category: 'openness', reversed: false },
  { id: 48, text: 'Felsefi tartismalar ilgimi ceker.', category: 'openness', reversed: false },
  { id: 49, text: 'Degisikliklere kolayca adapte olurum.', category: 'openness', reversed: false },
  { id: 50, text: 'Merakli bir insanimdir.', category: 'openness', reversed: false },
];

// Likert olcegi
const LIKERT_OPTIONS = [
  { value: 1, label: 'Kesinlikle Katilmiyorum' },
  { value: 2, label: 'Katilmiyorum' },
  { value: 3, label: 'Kararsizim' },
  { value: 4, label: 'Katiliyorum' },
  { value: 5, label: 'Kesinlikle Katiliyorum' },
];

export default function PersonalityTestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const category = CATEGORIES.find(c => c.id === question?.category);
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const canProceed = answers[question?.id] !== undefined;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < QUESTIONS.length) {
      alert('Lutfen tum sorulari cevaplayin.');
      return;
    }

    setSubmitting(true);

    // Skorlari hesapla
    const scores: Record<string, { total: number; count: number }> = {};
    CATEGORIES.forEach(cat => {
      scores[cat.id] = { total: 0, count: 0 };
    });

    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const score = q.reversed ? (6 - answer) : answer;
        scores[q.category].total += score;
        scores[q.category].count += 1;
      }
    });

    // Normalize (0-100)
    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count; // 1-5 arasi
      normalizedScores[key] = Math.round(((avg - 1) / 4) * 100); // 0-100 arasi
    });

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    // Seans kullan (1 seans dus)
    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'big-five',
          testName: 'Big Five Kisilik Envanteri',
          scores: normalizedScores,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'SESSION_LIMIT_REACHED') {
          alert('Seans limitinize ulastiniz. Daha fazla test icin plan yukseltmeniz gerekiyor.');
          setSubmitting(false);
          router.push('/pricing');
          return;
        }
        throw new Error(data.error || 'Bir hata olustu');
      }

      // Sonuclari kaydet
      const testResult = {
        id: data.sessionId || Date.now().toString(),
        type: 'big-five',
        answers,
        scores: normalizedScores,
        completedAt: new Date().toISOString(),
        duration,
      };

      // LocalStorage'a kaydet
      localStorage.setItem('lastTestResult', JSON.stringify(testResult));

      // Auth change event'i gonder (navbar guncellenmesi icin)
      window.dispatchEvent(new Event('auth-change'));

      // Sonuc sayfasina yonlendir
      router.push(`/tests/personality/result?id=${testResult.id}`);
    } catch (error) {
      console.error('Test submit error:', error);
      alert('Test kaydedilirken bir hata olustu. Lutfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  if (showIntro) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Big Five Kisilik Envanteri</h1>
                <p className="text-muted-foreground text-sm">
                  Bes Faktor Kisilik Modeli (Costa & McCrae, 1992)
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <h3 className="font-medium mb-2">Test Hakkinda</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      50 soru, 5 kategori
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Yaklasik 15-20 dakika
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      AI destekli detayli rapor
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">Onemli Bilgi</p>
                      <p className="text-muted-foreground">
                        Bu test tamamlandiginda seans hakkinizdan 1 adet dusulecektir.
                        Karsiliginda detayli AI raporu ve PDF ciktisi alacaksiniz.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kvkkAccepted}
                      onChange={(e) => setKvkkAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      <strong className="text-foreground">KVKK Aydinlatma Metni:</strong> Kisisel verilerimin
                      islenmesine iliskin aydinlatma metnini okudum ve kabul ediyorum. Verilerim
                      yalnizca kisilik analizi amaciyla kullanilacaktir.
                    </span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!kvkkAccepted}
                onClick={() => setShowIntro(false)}
              >
                Teste Basla
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Soru {currentQuestion + 1} / {QUESTIONS.length}
              </span>
              <span className="text-muted-foreground">
                {answeredCount} cevaplandi
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Kategori Badge */}
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
            >
              {category?.name}
            </span>
          </div>

          {/* Soru Karti */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-6"
            >
              <h2 className="text-xl font-medium mb-8 text-center">
                {question.text}
              </h2>

              <div className="space-y-3">
                {LIKERT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      answers[question.id] === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[question.id] === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {answers[question.id] === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Onceki
            </Button>

            {currentQuestion < QUESTIONS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
              >
                Sonraki
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < QUESTIONS.length || submitting}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hesaplaniyor...
                  </>
                ) : (
                  <>
                    Testi Tamamla
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Hizli Gecis:</p>
            <div className="flex flex-wrap gap-1">
              {QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                    idx === currentQuestion
                      ? 'bg-primary text-primary-foreground'
                      : answers[QUESTIONS[idx].id] !== undefined
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
