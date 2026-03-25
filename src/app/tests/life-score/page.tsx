'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Heart, Target, Briefcase, Users,
  Activity, Wallet, TrendingUp, Scale, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Thorius Hayat Skoru - 8 Boyut
// Akademik Temeller: PERMA (Seligman, 2011), Psikolojik Iyi Olus (Ryff, 1989), Yasam Doyumu (Diener, 1985)
const CATEGORIES = [
  {
    id: 'happiness',
    name: 'Mutluluk & Pozitif Duygular',
    nameShort: 'Mutluluk',
    color: '#F59E0B',
    icon: Sparkles,
    description: 'Gunluk yasam icinde deneyimlenen olumlu duygular ve genel mutluluk',
    academic: 'PERMA-P (Seligman)',
  },
  {
    id: 'meaning',
    name: 'Anlam & Amac',
    nameShort: 'Anlam',
    color: '#8B5CF6',
    icon: Target,
    description: 'Yasamin anlamli hissedilmesi ve buyuk bir amaca hizmet etme duygusu',
    academic: 'PERMA-M + Ryff',
  },
  {
    id: 'achievement',
    name: 'Basari & Kariyer',
    nameShort: 'Basari',
    color: '#10B981',
    icon: Briefcase,
    description: 'Hedeflere ulasma, profesyonel gelisim ve kariyer tatmini',
    academic: 'PERMA-A',
  },
  {
    id: 'relationships',
    name: 'Iliskiler & Sosyal Bag',
    nameShort: 'Iliskiler',
    color: '#EC4899',
    icon: Users,
    description: 'Yakin iliskiler, sosyal destek ve ait olma duygusu',
    academic: 'PERMA-R + Ryff',
  },
  {
    id: 'health',
    name: 'Saglik & Enerji',
    nameShort: 'Saglik',
    color: '#EF4444',
    icon: Activity,
    description: 'Fiziksel saglik, enerji duzeyi ve yasam gucu',
    academic: 'WHO Well-being',
  },
  {
    id: 'finance',
    name: 'Finansal Guvenlik',
    nameShort: 'Finans',
    color: '#06B6D4',
    icon: Wallet,
    description: 'Maddi guvenlik, finansal ozgurluk ve ekonomik refah',
    academic: 'Life Satisfaction',
  },
  {
    id: 'growth',
    name: 'Kisisel Gelisim',
    nameShort: 'Gelisim',
    color: '#14B8A6',
    icon: TrendingUp,
    description: 'Surekli ogrenme, potansiyeli gerceklestirme ve oz-gelisim',
    academic: 'Ryff PWB',
  },
  {
    id: 'balance',
    name: 'Yasam Dengesi',
    nameShort: 'Denge',
    color: '#6366F1',
    icon: Scale,
    description: 'Is-yasam dengesi, zaman yonetimi ve yasam alanlari uyumu',
    academic: 'Work-Life Balance',
  },
];

// 48 Soru - Her boyutta 6 soru
const QUESTIONS: { id: number; text: string; category: string; reversed: boolean }[] = [
  // Mutluluk & Pozitif Duygular (6 soru)
  { id: 1, text: 'Cogu gun kendimi mutlu ve nesesli hissediyorum.', category: 'happiness', reversed: false },
  { id: 2, text: 'Hayatimda sevinc ve keyif veren anlar siklikla yasiyorum.', category: 'happiness', reversed: false },
  { id: 3, text: 'Sabah uyandimda genellikle gune olumlu bir duyguyla basliyorum.', category: 'happiness', reversed: false },
  { id: 4, text: 'Kucuk seylere supkredebildigimi ve zevk alabildigimi dusunuyorum.', category: 'happiness', reversed: false },
  { id: 5, text: 'Genel olarak hayatimdan memnunum.', category: 'happiness', reversed: false },
  { id: 6, text: 'Gulumsuyor ve guluyorum siklikla.', category: 'happiness', reversed: false },

  // Anlam & Amac (6 soru)
  { id: 7, text: 'Hayatimin bir amaci ve anlami oldugunu hissediyorum.', category: 'meaning', reversed: false },
  { id: 8, text: 'Yaptigim isler benden buyuk bir seye hizmet ediyor.', category: 'meaning', reversed: false },
  { id: 9, text: 'Degerlerime uygun bir yasam suruyorum.', category: 'meaning', reversed: false },
  { id: 10, text: 'Baskalarina katki sagladigimi hissediyorum.', category: 'meaning', reversed: false },
  { id: 11, text: 'Gelecege dair umut verici hedeflerim var.', category: 'meaning', reversed: false },
  { id: 12, text: 'Hayatimin yonu ve rotasi konusunda netim.', category: 'meaning', reversed: false },

  // Basari & Kariyer (6 soru)
  { id: 13, text: 'Profesyonel hayatimda ilerleme kaydediyorum.', category: 'achievement', reversed: false },
  { id: 14, text: 'Isimde basari ve tatmin duygusu yasiyorum.', category: 'achievement', reversed: false },
  { id: 15, text: 'Hedeflerime dogru istikrarli adimlar atiyorum.', category: 'achievement', reversed: false },
  { id: 16, text: 'Yeteneklerimi ve becerilerimi kullanabildigimi hissediyorum.', category: 'achievement', reversed: false },
  { id: 17, text: 'Kariyerimde oldugum yerden memnunum.', category: 'achievement', reversed: false },
  { id: 18, text: 'Zorluklar karsisinda azimle devam edebiliyorum.', category: 'achievement', reversed: false },

  // Iliskiler & Sosyal Bag (6 soru)
  { id: 19, text: 'Hayatimda beni anlayan ve destekleyen insanlar var.', category: 'relationships', reversed: false },
  { id: 20, text: 'Ailemle iliskilerim tatmin edici.', category: 'relationships', reversed: false },
  { id: 21, text: 'Gercek ve derin arkadasliklarim var.', category: 'relationships', reversed: false },
  { id: 22, text: 'Ihtiyacim oldugunda guvenebilecegim insanlar var.', category: 'relationships', reversed: false },
  { id: 23, text: 'Sosyal cevremi genisletmekte ve surdurmekte basariliyim.', category: 'relationships', reversed: false },
  { id: 24, text: 'Sevdiklerimle kaliteli zaman geciriyorum.', category: 'relationships', reversed: false },

  // Saglik & Enerji (6 soru)
  { id: 25, text: 'Fiziksel sagligim genel olarak iyi durumda.', category: 'health', reversed: false },
  { id: 26, text: 'Gun boyunca yeterli enerjim var.', category: 'health', reversed: false },
  { id: 27, text: 'Duzgenli egzersiz yapiyorum veya fiziksel olarak aktifim.', category: 'health', reversed: false },
  { id: 28, text: 'Uyku kalitem ve suresi yeterli.', category: 'health', reversed: false },
  { id: 29, text: 'Saglikli beslenmeye dikkat ediyorum.', category: 'health', reversed: false },
  { id: 30, text: 'Bedenimi dinliyor ve ona iyi bakiyorum.', category: 'health', reversed: false },

  // Finansal Guvenlik (6 soru)
  { id: 31, text: 'Finansal durumum temel ihtiyaclarimi karsilamaya yetiyor.', category: 'finance', reversed: false },
  { id: 32, text: 'Gelecegim icin birikim yapabiliyorum.', category: 'finance', reversed: false },
  { id: 33, text: 'Para konusunda stres ve endise duymuyorum.', category: 'finance', reversed: false },
  { id: 34, text: 'Harcamalarimi ve butcemi kontrol altinda tutabiliyorum.', category: 'finance', reversed: false },
  { id: 35, text: 'Beklenmedik masraflara karsi hazirligim var.', category: 'finance', reversed: false },
  { id: 36, text: 'Finansal hedeflerime dogru ilerliyorum.', category: 'finance', reversed: false },

  // Kisisel Gelisim (6 soru)
  { id: 37, text: 'Surekli yeni seyler ogreniyor ve kendimi gelistiriyorum.', category: 'growth', reversed: false },
  { id: 38, text: 'Konfor alanimin disina cikmaya acigim.', category: 'growth', reversed: false },
  { id: 39, text: 'Potansiyelimi gerceklestirme yolunda ilerliyorum.', category: 'growth', reversed: false },
  { id: 40, text: 'Kitap, kurs veya egitimlerle kendime yatirim yapiyorum.', category: 'growth', reversed: false },
  { id: 41, text: 'Hatalarimdan ders cikarip buyuyorum.', category: 'growth', reversed: false },
  { id: 42, text: 'Bir yil onceki halimle karsilastirildigimda gelismisim.', category: 'growth', reversed: false },

  // Yasam Dengesi (6 soru)
  { id: 43, text: 'Is ve ozel hayatim arasinda saglikli bir denge var.', category: 'balance', reversed: false },
  { id: 44, text: 'Kendime ve hobilerime yeterli zaman ayirabiliyorum.', category: 'balance', reversed: false },
  { id: 45, text: 'Zamanimi verimli ve dengeli yonetiyorum.', category: 'balance', reversed: false },
  { id: 46, text: 'Is disinda dinlenme ve yenilenme firsati buluyorum.', category: 'balance', reversed: false },
  { id: 47, text: 'Hayatimin farkli alanlarini ihmal etmeden yasiyorum.', category: 'balance', reversed: false },
  { id: 48, text: 'Hayir demeyi ve sinir koymavi biliyorum.', category: 'balance', reversed: false },
];

// Likert olcegi (1-10)
const LIKERT_OPTIONS = [
  { value: 1, label: '1', description: 'Hic katilmiyorum' },
  { value: 2, label: '2', description: '' },
  { value: 3, label: '3', description: '' },
  { value: 4, label: '4', description: '' },
  { value: 5, label: '5', description: 'Kismen katiliyorum' },
  { value: 6, label: '6', description: '' },
  { value: 7, label: '7', description: '' },
  { value: 8, label: '8', description: '' },
  { value: 9, label: '9', description: '' },
  { value: 10, label: '10', description: 'Tamamen katiliyorum' },
];

export default function LifeScoreTestPage() {
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
    // Otomatik ilerleme
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
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
        const score = q.reversed ? (11 - answer) : answer;
        scores[q.category].total += score;
        scores[q.category].count += 1;
      }
    });

    // Normalize (0-100)
    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count; // 1-10 arasi
      normalizedScores[key] = Math.round(((avg - 1) / 9) * 100); // 0-100 arasi
    });

    // Genel Hayat Skoru hesapla (ortalama)
    const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    const overallScore = Math.round(totalScore / Object.keys(normalizedScores).length);
    normalizedScores['overall'] = overallScore;

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    // Seans kullan
    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'life-score',
          testName: 'Thorius Hayat Skoru Testi',
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
        type: 'life-score',
        answers,
        scores: normalizedScores,
        completedAt: new Date().toISOString(),
        duration,
      };

      localStorage.setItem('lastLifeScoreResult', JSON.stringify(testResult));
      window.dispatchEvent(new Event('auth-change'));
      router.push(`/tests/life-score/result?id=${testResult.id}`);
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Thorius Hayat Skoru Testi</h1>
                <p className="text-muted-foreground text-sm">
                  PERMA + Psikolojik Iyi Olus + Yasam Dengesi
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <h3 className="font-medium mb-3">Test Hakkinda</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      48 soru, 8 yasam alani
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      Yaklasik 10-12 dakika
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 shrink-0" />
                      Thorius'a ozel hibrit model
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20">
                  <h3 className="font-medium mb-3 text-amber-600">8 Yasam Alani</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                          </div>
                          <span className="truncate">{cat.nameShort}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <h3 className="font-medium mb-2 text-purple-600">Akademik Altyapi</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• PERMA Modeli - Martin Seligman (2011)</li>
                    <li>• Psikolojik Iyi Olus - Carol Ryff (1989)</li>
                    <li>• Yasam Doyumu Olcegi - Ed Diener (1985)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">Onemli Bilgi</p>
                      <p className="text-muted-foreground">
                        Bu test tamamlandiginda seans hakkinizdan 1 adet dusulecektir.
                        Karsiliginda detayli AI raporu ve kisisel gelisim plani alacaksiniz.
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
                      islenmesine iliskin aydinlatma metnini okudum ve kabul ediyorum.
                    </span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600"
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
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full"
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
                {category.nameShort}
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
              <h2 className="text-lg sm:text-xl font-medium mb-8 text-center leading-relaxed">
                {question.text}
              </h2>

              {/* 1-10 Slider Style */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Hic katilmiyorum</span>
                  <span>Tamamen katiliyorum</span>
                </div>
                <div className="flex gap-2">
                  {LIKERT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`flex-1 aspect-square rounded-xl border-2 text-lg font-bold transition-all ${
                        answers[question.id] === option.value
                          ? 'border-amber-500 bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-110 shadow-lg'
                          : 'border-border hover:border-amber-500/50 hover:bg-amber-500/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
                className="bg-gradient-to-r from-amber-500 to-orange-500"
              >
                Sonraki
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < QUESTIONS.length || submitting}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
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
              {QUESTIONS.map((q, idx) => {
                const cat = CATEGORIES.find(c => c.id === q.category);
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                      idx === currentQuestion
                        ? 'text-white'
                        : answers[QUESTIONS[idx].id] !== undefined
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-muted hover:bg-muted-foreground/20'
                    }`}
                    style={idx === currentQuestion ? { backgroundColor: cat?.color } : {}}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
  );
}
