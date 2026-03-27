'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';

// Big Five Kategorileri
const CATEGORIES = [
  {
    id: 'extraversion',
    name: 'Dışadönüklük',
    nameEn: 'Extraversion',
    color: '#FF6B6B',
    description: 'Sosyallik, enerjiklik ve olumlu duygular',
    icon: '🗣️',
  },
  {
    id: 'agreeableness',
    name: 'Uyumluluk',
    nameEn: 'Agreeableness',
    color: '#4ECDC4',
    description: 'İşbirliği, güven ve empati',
    icon: '🤝',
  },
  {
    id: 'conscientiousness',
    name: 'Sorumluluk',
    nameEn: 'Conscientiousness',
    color: '#45B7D1',
    description: 'Öz-disiplin, düzenlilik ve başarı odaklılık',
    icon: '📋',
  },
  {
    id: 'neuroticism',
    name: 'Duygusal Denge',
    nameEn: 'Neuroticism (reversed)',
    color: '#96CEB4',
    description: 'Duygusal istikrar ve stres yönetimi',
    icon: '🧘',
  },
  {
    id: 'openness',
    name: 'Açıklık',
    nameEn: 'Openness',
    color: '#DDA0DD',
    description: 'Yaratıcılık, merak ve yeni deneyimlere açıklık',
    icon: '💡',
  },
];

// 50 Soru - Her kategoride 10 soru (Türkçe karakterlerle)
const QUESTIONS: { id: number; text: string; category: string; reversed: boolean }[] = [
  // Dışadönüklük (10 soru)
  { id: 1, text: 'Toplantılarda konuşmayı ve fikirlerimi paylaşmayı severim.', category: 'extraversion', reversed: false },
  { id: 2, text: 'Yeni insanlarla tanışmak beni heyecanlandırır.', category: 'extraversion', reversed: false },
  { id: 3, text: 'Partilerde genellikle odanın ortasında olurum.', category: 'extraversion', reversed: false },
  { id: 4, text: 'Yalnız kalmaktansa insanlarla birlikte olmayı tercih ederim.', category: 'extraversion', reversed: false },
  { id: 5, text: 'Grup aktivitelerinde liderlik rolünü üstlenirim.', category: 'extraversion', reversed: false },
  { id: 6, text: 'Sessiz ve sakin ortamları tercih ederim.', category: 'extraversion', reversed: true },
  { id: 7, text: 'Konuşmaları başlatmaktan çekinmem.', category: 'extraversion', reversed: false },
  { id: 8, text: 'Sosyal etkinliklerden sonra kendimi enerjik hissederim.', category: 'extraversion', reversed: false },
  { id: 9, text: 'Dikkat çekmeyi severim.', category: 'extraversion', reversed: false },
  { id: 10, text: 'Tanınmayan ortamlarda bile rahat hissederim.', category: 'extraversion', reversed: false },

  // Uyumluluk (10 soru)
  { id: 11, text: 'Başkalarına yardım etmek beni mutlu eder.', category: 'agreeableness', reversed: false },
  { id: 12, text: 'İnsanların iyi niyetli olduğuna inanırım.', category: 'agreeableness', reversed: false },
  { id: 13, text: 'Çatışma yerine uzlaşmayı tercih ederim.', category: 'agreeableness', reversed: false },
  { id: 14, text: 'Başkalarının duygularını kolayca anlarım.', category: 'agreeableness', reversed: false },
  { id: 15, text: 'Affetmekte zorlanmam.', category: 'agreeableness', reversed: false },
  { id: 16, text: 'Rekabetçi olmaktansa işbirliği yapmayı tercih ederim.', category: 'agreeableness', reversed: false },
  { id: 17, text: 'Başkalarına karşı sabırlıyımdır.', category: 'agreeableness', reversed: false },
  { id: 18, text: 'Kibar ve saygılıyımdır.', category: 'agreeableness', reversed: false },
  { id: 19, text: 'Başkalarının ihtiyaçlarını kendi ihtiyaçlarımdan önce düşünürüm.', category: 'agreeableness', reversed: false },
  { id: 20, text: 'Eleştiri yaparken yapıcı olmaya çalışırım.', category: 'agreeableness', reversed: false },

  // Sorumluluk (10 soru)
  { id: 21, text: 'İşlerimi zamanında tamamlarım.', category: 'conscientiousness', reversed: false },
  { id: 22, text: 'Detaylara dikkat ederim.', category: 'conscientiousness', reversed: false },
  { id: 23, text: 'Her zaman hazırlıklı olurum.', category: 'conscientiousness', reversed: false },
  { id: 24, text: 'Düzeni ve temizliği severim.', category: 'conscientiousness', reversed: false },
  { id: 25, text: 'Bir plan yapıp ona uyarım.', category: 'conscientiousness', reversed: false },
  { id: 26, text: 'Hedeflerime ulaşmak için çok çalışırım.', category: 'conscientiousness', reversed: false },
  { id: 27, text: 'Sorumluluklarımı ciddiye alırım.', category: 'conscientiousness', reversed: false },
  { id: 28, text: 'İşleri yarım bırakmam.', category: 'conscientiousness', reversed: false },
  { id: 29, text: 'Kurallara ve prosedürlere uyarım.', category: 'conscientiousness', reversed: false },
  { id: 30, text: 'Kararlıyım ve azimliyimdir.', category: 'conscientiousness', reversed: false },

  // Duygusal Denge (10 soru)
  { id: 31, text: 'Stresli durumlarda sakin kalırım.', category: 'neuroticism', reversed: true },
  { id: 32, text: 'Duygularımı kontrol altında tutabilirim.', category: 'neuroticism', reversed: true },
  { id: 33, text: 'Kolayca endişelenmem.', category: 'neuroticism', reversed: true },
  { id: 34, text: 'Kendime güvenirim.', category: 'neuroticism', reversed: true },
  { id: 35, text: 'Başarısızlıklardan hızlı toparlarım.', category: 'neuroticism', reversed: true },
  { id: 36, text: 'Ruh halim genellikle istikrarlıdır.', category: 'neuroticism', reversed: true },
  { id: 37, text: 'Başkalarının beni nasıl gördüğü konusunda rahatım.', category: 'neuroticism', reversed: true },
  { id: 38, text: 'Gelecek hakkında iyimserim.', category: 'neuroticism', reversed: true },
  { id: 39, text: 'Zor zamanlarda bile umudumu kaybetmem.', category: 'neuroticism', reversed: true },
  { id: 40, text: 'Eleştirilerden kolayca etkilenmem.', category: 'neuroticism', reversed: true },

  // Açıklık (10 soru)
  { id: 41, text: 'Yeni fikirler keşfetmeyi severim.', category: 'openness', reversed: false },
  { id: 42, text: 'Sanat ve güzellik beni derinden etkiler.', category: 'openness', reversed: false },
  { id: 43, text: 'Farklı kültürleri ve bakış açılarını anlamaya çalışırım.', category: 'openness', reversed: false },
  { id: 44, text: 'Hayal gücüm güçlüdür.', category: 'openness', reversed: false },
  { id: 45, text: 'Soyut kavramlar üzerinde düşünmekten zevk alırım.', category: 'openness', reversed: false },
  { id: 46, text: 'Rutin işler yerine yeni deneyimler tercih ederim.', category: 'openness', reversed: false },
  { id: 47, text: 'Yaratıcı çözümler bulmakta iyiyimdir.', category: 'openness', reversed: false },
  { id: 48, text: 'Felsefi tartışmalar ilgimi çeker.', category: 'openness', reversed: false },
  { id: 49, text: 'Değişikliklere kolayca adapte olurum.', category: 'openness', reversed: false },
  { id: 50, text: 'Meraklı bir insanımdır.', category: 'openness', reversed: false },
];

// Likert ölçeği
const LIKERT_OPTIONS = [
  { value: 1, label: 'Kesinlikle Katılmıyorum', short: '1' },
  { value: 2, label: 'Katılmıyorum', short: '2' },
  { value: 3, label: 'Kararsızım', short: '3' },
  { value: 4, label: 'Katılıyorum', short: '4' },
  { value: 5, label: 'Kesinlikle Katılıyorum', short: '5' },
];

export default function PersonalityTestPage() {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const categoryQuestions = QUESTIONS.filter(q => q.category === currentCategory.id);
  const categoryProgress = ((currentCategoryIndex + 1) / CATEGORIES.length) * 100;

  // Bu kategorideki cevaplanmış soru sayısı
  const categoryAnsweredCount = categoryQuestions.filter(q => answers[q.id] !== undefined).length;
  const isCategoryComplete = categoryAnsweredCount === categoryQuestions.length;

  // Toplam cevaplanmış
  const totalAnsweredCount = Object.keys(answers).length;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (totalAnsweredCount < QUESTIONS.length) {
      alert('Lütfen tüm soruları cevaplayın.');
      return;
    }

    setSubmitting(true);

    // Skorları hesapla
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

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'big-five',
          testName: 'Big Five Kişilik Envanteri',
          scores: normalizedScores,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'SESSION_LIMIT_REACHED') {
          alert('Seans limitinize ulaştınız. Daha fazla test için plan yükseltmeniz gerekiyor.');
          setSubmitting(false);
          router.push('/pricing');
          return;
        }
        throw new Error(data.error || 'Bir hata oluştu');
      }

      const testResult = {
        id: data.sessionId || Date.now().toString(),
        type: 'big-five',
        answers,
        scores: normalizedScores,
        completedAt: new Date().toISOString(),
        duration,
      };

      localStorage.setItem('lastTestResult', JSON.stringify(testResult));
      window.dispatchEvent(new Event('auth-change'));
      router.push(`/tests/personality/result?id=${testResult.id}`);
    } catch (error) {
      console.error('Test submit error:', error);
      alert('Test kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Big Five Kişilik Envanteri</h1>
              <p className="text-muted-foreground text-sm">
                Beş Faktör Kişilik Modeli (Costa & McCrae, 1992)
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <h3 className="font-medium mb-2">Test Hakkında</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    5 kategori, her biri 10 soru
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Yaklaşık 10-15 dakika
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    AI destekli detaylı rapor
                  </li>
                </ul>
              </div>

              {/* Kategoriler önizleme */}
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="text-center p-2 rounded-lg"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <p className="text-xs font-medium" style={{ color: cat.color }}>{cat.name}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Önemli Bilgi</p>
                    <p className="text-muted-foreground">
                      Bu test tamamlandığında seans hakkınızdan 1 adet düşülecektir.
                      Karşılığında detaylı AI raporu ve PDF çıktısı alacaksınız.
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
                    <strong className="text-foreground">KVKK Aydınlatma Metni:</strong> Kişisel verilerimin
                    işlenmesine ilişkin aydınlatma metnini okudum ve kabul ediyorum. Verilerim
                    yalnızca kişilik analizi amacıyla kullanılacaktır.
                  </span>
                </label>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!kvkkAccepted}
              onClick={() => setShowConfirmModal(true)}
            >
              Teste Başla
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <SessionConfirmModal
          isOpen={showConfirmModal}
          onConfirm={() => {
            setShowConfirmModal(false);
            setShowIntro(false);
          }}
          onCancel={() => setShowConfirmModal(false)}
          type="test"
          title="Kişilik Testi Başlatılacak"
          description="Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında Big Five kişilik profiliniz ve detaylı AI analizi alacaksınız."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Kategori Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span
                className="text-3xl"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              >
                {currentCategory.icon}
              </span>
              <div>
                <h2 className="font-bold text-lg" style={{ color: currentCategory.color }}>
                  {currentCategory.name}
                </h2>
                <p className="text-xs text-muted-foreground">{currentCategory.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Kategori {currentCategoryIndex + 1} / {CATEGORIES.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {categoryAnsweredCount} / {categoryQuestions.length} cevaplandı
              </p>
            </div>
          </div>

          {/* Kategori tab'ları */}
          <div className="flex gap-1 mb-3">
            {CATEGORIES.map((cat, idx) => {
              const catQuestions = QUESTIONS.filter(q => q.category === cat.id);
              const catAnswered = catQuestions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = catAnswered === catQuestions.length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategoryIndex(idx)}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-all',
                    idx === currentCategoryIndex
                      ? 'ring-2 ring-offset-2 ring-primary'
                      : ''
                  )}
                  style={{
                    backgroundColor: isComplete ? cat.color : `${cat.color}30`,
                  }}
                  title={`${cat.name}: ${catAnswered}/${catQuestions.length}`}
                />
              );
            })}
          </div>
        </div>

        {/* Sorular - Hepsi bir arada */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Likert Scale Header */}
            <div className="bg-card rounded-xl border border-border p-4 sticky top-16 z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground w-1/2">İfade</span>
                <div className="flex gap-1 sm:gap-2 w-1/2 justify-end">
                  {LIKERT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className="w-10 sm:w-14 text-center"
                      title={opt.label}
                    >
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        {opt.value === 1 ? 'Kesinlikle' : opt.value === 5 ? 'Kesinlikle' : ''}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        {opt.value === 1 ? 'Hayır' : opt.value === 3 ? 'Kararsız' : opt.value === 5 ? 'Evet' : ''}
                      </span>
                      <span className="text-xs font-bold sm:hidden">{opt.short}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Soru Listesi */}
            {categoryQuestions.map((question, idx) => (
              <div
                key={question.id}
                className={cn(
                  'bg-card rounded-xl border p-4 transition-all',
                  answers[question.id] !== undefined
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: answers[question.id] !== undefined ? '#22c55e' : `${currentCategory.color}20`,
                        color: answers[question.id] !== undefined ? 'white' : currentCategory.color,
                      }}
                    >
                      {answers[question.id] !== undefined ? '✓' : idx + 1}
                    </span>
                    <p className="text-sm sm:text-base">{question.text}</p>
                  </div>

                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    {LIKERT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(question.id, opt.value)}
                        className={cn(
                          'w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 transition-all font-medium text-sm',
                          answers[question.id] === opt.value
                            ? 'border-primary bg-primary text-primary-foreground scale-105'
                            : 'border-border hover:border-primary/50 hover:bg-muted'
                        )}
                        title={opt.label}
                      >
                        {opt.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border">
          <Button
            variant="outline"
            onClick={handlePrevCategory}
            disabled={currentCategoryIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Önceki
          </Button>

          <div className="text-center">
            <p className="text-sm font-medium">
              {totalAnsweredCount} / {QUESTIONS.length}
            </p>
            <p className="text-xs text-muted-foreground">toplam cevap</p>
          </div>

          {currentCategoryIndex < CATEGORIES.length - 1 ? (
            <Button
              onClick={handleNextCategory}
              disabled={!isCategoryComplete}
            >
              Sonraki
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={totalAnsweredCount < QUESTIONS.length || submitting}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hesaplanıyor...
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
      </div>
    </main>
  );
}
