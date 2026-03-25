'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Brain, Users, Shield, Zap, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// EQ-i Kategorileri (Bar-On, 1997)
const CATEGORIES = [
  {
    id: 'self-awareness',
    name: 'Oz Farkindalik',
    nameEn: 'Self-Awareness',
    color: '#8B5CF6',
    icon: Brain,
    description: 'Kendi duygularini tanima ve anlama yetisi',
  },
  {
    id: 'self-management',
    name: 'Oz Yonetim',
    nameEn: 'Self-Management',
    color: '#EC4899',
    icon: Target,
    description: 'Duygulari ve davranislari yonetme becerisi',
  },
  {
    id: 'social-awareness',
    name: 'Sosyal Farkindalik',
    nameEn: 'Social Awareness',
    color: '#06B6D4',
    icon: Users,
    description: 'Baskalarinin duygularini anlama ve empati',
  },
  {
    id: 'relationship-management',
    name: 'Iliski Yonetimi',
    nameEn: 'Relationship Management',
    color: '#10B981',
    icon: Heart,
    description: 'Saglikli iliskiler kurma ve surdurebilme',
  },
  {
    id: 'stress-management',
    name: 'Stres Yonetimi',
    nameEn: 'Stress Management',
    color: '#F59E0B',
    icon: Shield,
    description: 'Stresle basa cikma ve esneklik',
  },
];

// 50 Soru - Her kategoride 10 soru (Bar-On EQ-i 2.0 modelinden uyarlanmistir)
const QUESTIONS: { id: number; text: string; category: string; reversed: boolean }[] = [
  // Oz Farkindalik (10 soru)
  { id: 1, text: 'Duygularimin ne oldugunu genellikle net bir sekilde bilirim.', category: 'self-awareness', reversed: false },
  { id: 2, text: 'Neden belli bir sekilde hissettigimi anlamakta zorlanmam.', category: 'self-awareness', reversed: false },
  { id: 3, text: 'Guclu ve zayif yonlerimin farkindayim.', category: 'self-awareness', reversed: false },
  { id: 4, text: 'Duygularimin davranislarimi nasil etkiledigini gorebilirim.', category: 'self-awareness', reversed: false },
  { id: 5, text: 'Kendime karsi durust ve gercekci bir bakis acisina sahibim.', category: 'self-awareness', reversed: false },
  { id: 6, text: 'Baskalari beni nasil gordugunun farkindayim.', category: 'self-awareness', reversed: false },
  { id: 7, text: 'Degerlerimin ve inanclarimin farkindayim.', category: 'self-awareness', reversed: false },
  { id: 8, text: 'Duygusal tepkilerimin kaynaklarini anlayabilirim.', category: 'self-awareness', reversed: false },
  { id: 9, text: 'Ic sesimi dinler ve ona guvenenim.', category: 'self-awareness', reversed: false },
  { id: 10, text: 'Kendimi tanimak icin zaman ayiririm.', category: 'self-awareness', reversed: false },

  // Oz Yonetim (10 soru)
  { id: 11, text: 'Olumsuz duygularimi kontrol altinda tutabilirim.', category: 'self-management', reversed: false },
  { id: 12, text: 'Dusunmeden hareket etmek yerine once dusunurum.', category: 'self-management', reversed: false },
  { id: 13, text: 'Zor durumlarda bile sakinligimi koruyabilirim.', category: 'self-management', reversed: false },
  { id: 14, text: 'Hedeflerime ulasmak icin cabalamaya devam ederim.', category: 'self-management', reversed: false },
  { id: 15, text: 'Hayal kirikliklarindan hizla toparlanabilirim.', category: 'self-management', reversed: false },
  { id: 16, text: 'Ani kararlara kapilmak yerine planli hareket ederim.', category: 'self-management', reversed: false },
  { id: 17, text: 'Olumsuz dusuncelerimi olumlu olanlara donusturebilirim.', category: 'self-management', reversed: false },
  { id: 18, text: 'Motivasyonumu kaybettigimde kendimi yeniden motive edebilirim.', category: 'self-management', reversed: false },
  { id: 19, text: 'Zaman yonetiminde basariliyim.', category: 'self-management', reversed: false },
  { id: 20, text: 'Ofkelendigimde bunu yapici sekilde ifade edebilirim.', category: 'self-management', reversed: false },

  // Sosyal Farkindalik (10 soru)
  { id: 21, text: 'Baskalarinin duygularini kolayca anlarim.', category: 'social-awareness', reversed: false },
  { id: 22, text: 'Insanlarin soz1u olmayan isaretlerini (beden dili, yuz ifadesi) okuyabilirim.', category: 'social-awareness', reversed: false },
  { id: 23, text: 'Kendimi baskalarinin yerine koyabilirim.', category: 'social-awareness', reversed: false },
  { id: 24, text: 'Bir odadaki duygusal havay algilayabilirim.', category: 'social-awareness', reversed: false },
  { id: 25, text: 'Baskalarinin ihtiyaclarini sezebilirim.', category: 'social-awareness', reversed: false },
  { id: 26, text: 'Farkli bakis acilarini anlayip saygi gosterebilirim.', category: 'social-awareness', reversed: false },
  { id: 27, text: 'Insanlar dertlerini benimle paylasmaktan cekinmezler.', category: 'social-awareness', reversed: false },
  { id: 28, text: 'Grup dinamiklerini ve iliskilerini anlayabilirim.', category: 'social-awareness', reversed: false },
  { id: 29, text: 'Kulturel farkliliklara karsi duyarliyim.', category: 'social-awareness', reversed: false },
  { id: 30, text: 'Baskalarinin motivasyonlarini anlayabilirim.', category: 'social-awareness', reversed: false },

  // Iliski Yonetimi (10 soru)
  { id: 31, text: 'Yeni insanlarla kolayca iletisim kurabilirim.', category: 'relationship-management', reversed: false },
  { id: 32, text: 'Uzun sureli ve anlamli iliskiler kurabilirim.', category: 'relationship-management', reversed: false },
  { id: 33, text: 'Catismalari yapici bir sekilde cozebilirim.', category: 'relationship-management', reversed: false },
  { id: 34, text: 'Geri bildirim vermekte ve almakta rahatim.', category: 'relationship-management', reversed: false },
  { id: 35, text: 'Takim calismasinda etkili bir rol ustlenirim.', category: 'relationship-management', reversed: false },
  { id: 36, text: 'Baskalarini motive edebilir ve ilham verebilirim.', category: 'relationship-management', reversed: false },
  { id: 37, text: 'Zor konusmalar yapabilir ve net iletisim kurabilirim.', category: 'relationship-management', reversed: false },
  { id: 38, text: 'Guven insa etmekte basariliyim.', category: 'relationship-management', reversed: false },
  { id: 39, text: 'Farkli kisilik tiplerine uyum saglayabilirim.', category: 'relationship-management', reversed: false },
  { id: 40, text: 'Isbirligini tesvik eder ve desteklerim.', category: 'relationship-management', reversed: false },

  // Stres Yonetimi (10 soru)
  { id: 41, text: 'Yogun baski altinda bile etkili calisabilirim.', category: 'stress-management', reversed: false },
  { id: 42, text: 'Belirsizlik durumlarinda rahat kalabilirim.', category: 'stress-management', reversed: false },
  { id: 43, text: 'Degisikliklere kolayca uyum saglayabilirim.', category: 'stress-management', reversed: false },
  { id: 44, text: 'Stresli durumlarda problem cozme yetenegimi koruyabilirim.', category: 'stress-management', reversed: false },
  { id: 45, text: 'Krizlerde sogukkanli kalabilirim.', category: 'stress-management', reversed: false },
  { id: 46, text: 'Is ve ozel hayat dengesini kurabilirim.', category: 'stress-management', reversed: false },
  { id: 47, text: 'Olumsuz durumlardan ders cikarabilirim.', category: 'stress-management', reversed: false },
  { id: 48, text: 'Saglikli stres yonetimi teknikleri kullanirim.', category: 'stress-management', reversed: false },
  { id: 49, text: 'Iyimserligimi zor zamanlarda bile koruyabilirim.', category: 'stress-management', reversed: false },
  { id: 50, text: 'Zorluklari firsata donusturebilirim.', category: 'stress-management', reversed: false },
];

// Likert olcegi
const LIKERT_OPTIONS = [
  { value: 1, label: 'Kesinlikle Katilmiyorum' },
  { value: 2, label: 'Katilmiyorum' },
  { value: 3, label: 'Kararsizim' },
  { value: 4, label: 'Katiliyorum' },
  { value: 5, label: 'Kesinlikle Katiliyorum' },
];

export default function EmotionalIntelligenceTestPage() {
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
      const avg = val.total / val.count;
      normalizedScores[key] = Math.round(((avg - 1) / 4) * 100);
    });

    // Genel EQ skoru hesapla (ortalama)
    const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    const overallEQ = Math.round(totalScore / Object.keys(normalizedScores).length);
    normalizedScores['overall'] = overallEQ;

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    // Seans kullan (1 seans dus)
    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'eq-i',
          testName: 'Duygusal Zeka Envanteri (EQ-i)',
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
        type: 'eq-i',
        answers,
        scores: normalizedScores,
        completedAt: new Date().toISOString(),
        duration,
      };

      // LocalStorage'a kaydet
      localStorage.setItem('lastEQTestResult', JSON.stringify(testResult));

      // Auth change event'i gonder
      window.dispatchEvent(new Event('auth-change'));

      // Sonuc sayfasina yonlendir
      router.push(`/tests/emotional-intelligence/result?id=${testResult.id}`);
    } catch (error) {
      console.error('Test submit error:', error);
      alert('Test kaydedilirken bir hata olustu. Lutfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  if (showIntro) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Duygusal Zeka Envanteri (EQ-i)</h1>
                <p className="text-muted-foreground text-sm">
                  Bar-On Emotional Quotient Inventory (1997)
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <h3 className="font-medium mb-3">Test Hakkinda</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      50 soru, 5 ana alan
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      Yaklasik 10-15 dakika
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                      Is dunyasinda en populer EQ testi
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                  <h3 className="font-medium mb-3 text-pink-600">Olculen 5 Ana Alan</h3>
                  <div className="grid gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                          </div>
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">- {cat.description}</span>
                        </div>
                      );
                    })}
                  </div>
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
                      yalnizca duygusal zeka analizi amaciyla kullanilacaktir.
                    </span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
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
    );
  }

  return (
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
                className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Kategori Badge */}
          <div className="mb-4">
            {category && (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {(() => {
                  const Icon = category.icon;
                  return <Icon className="h-4 w-4" />;
                })()}
                {category.name}
              </span>
            )}
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
                        ? 'border-pink-500 bg-pink-500/10 text-pink-600'
                        : 'border-border hover:border-pink-500/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[question.id] === option.value
                            ? 'border-pink-500 bg-pink-500'
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
                className="bg-gradient-to-r from-pink-500 to-rose-600"
              >
                Sonraki
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < QUESTIONS.length || submitting}
                className="bg-gradient-to-r from-pink-500 to-rose-600"
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
                      ? 'bg-pink-500 text-white'
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
  );
}
