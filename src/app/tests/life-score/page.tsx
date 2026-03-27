'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Target, Briefcase, Users,
  Activity, Wallet, TrendingUp, Scale, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';

// Thorius Hayat Skoru - 8 Boyut
// Akademik Temeller: PERMA (Seligman, 2011), Psikolojik İyi Oluş (Ryff, 1989), Yaşam Doyumu (Diener, 1985)
const CATEGORIES = [
  {
    id: 'happiness',
    name: 'Mutluluk & Pozitif Duygular',
    nameShort: 'Mutluluk',
    color: '#F59E0B',
    icon: Sparkles,
    description: 'Günlük yaşam içinde deneyimlenen olumlu duygular ve genel mutluluk',
    academic: 'PERMA-P (Seligman)',
  },
  {
    id: 'meaning',
    name: 'Anlam & Amaç',
    nameShort: 'Anlam',
    color: '#8B5CF6',
    icon: Target,
    description: 'Yaşamın anlamlı hissedilmesi ve büyük bir amaca hizmet etme duygusu',
    academic: 'PERMA-M + Ryff',
  },
  {
    id: 'achievement',
    name: 'Başarı & Kariyer',
    nameShort: 'Başarı',
    color: '#10B981',
    icon: Briefcase,
    description: 'Hedeflere ulaşma, profesyonel gelişim ve kariyer tatmini',
    academic: 'PERMA-A',
  },
  {
    id: 'relationships',
    name: 'İlişkiler & Sosyal Bağ',
    nameShort: 'İlişkiler',
    color: '#EC4899',
    icon: Users,
    description: 'Yakın ilişkiler, sosyal destek ve ait olma duygusu',
    academic: 'PERMA-R + Ryff',
  },
  {
    id: 'health',
    name: 'Sağlık & Enerji',
    nameShort: 'Sağlık',
    color: '#EF4444',
    icon: Activity,
    description: 'Fiziksel sağlık, enerji düzeyi ve yaşam gücü',
    academic: 'WHO Well-being',
  },
  {
    id: 'finance',
    name: 'Finansal Güvenlik',
    nameShort: 'Finans',
    color: '#06B6D4',
    icon: Wallet,
    description: 'Maddi güvenlik, finansal özgürlük ve ekonomik refah',
    academic: 'Life Satisfaction',
  },
  {
    id: 'growth',
    name: 'Kişisel Gelişim',
    nameShort: 'Gelişim',
    color: '#14B8A6',
    icon: TrendingUp,
    description: 'Sürekli öğrenme, potansiyeli gerçekleştirme ve öz-gelişim',
    academic: 'Ryff PWB',
  },
  {
    id: 'balance',
    name: 'Yaşam Dengesi',
    nameShort: 'Denge',
    color: '#6366F1',
    icon: Scale,
    description: 'İş-yaşam dengesi, zaman yönetimi ve yaşam alanları uyumu',
    academic: 'Work-Life Balance',
  },
];

// 48 Soru - Her boyutta 6 soru
const QUESTIONS: { id: number; text: string; category: string; reversed: boolean }[] = [
  // Mutluluk & Pozitif Duygular (6 soru)
  { id: 1, text: 'Çoğu gün kendimi mutlu ve neşeli hissediyorum.', category: 'happiness', reversed: false },
  { id: 2, text: 'Hayatımda sevinç ve keyif veren anlar sıklıkla yaşıyorum.', category: 'happiness', reversed: false },
  { id: 3, text: 'Sabah uyandığımda genellikle güne olumlu bir duyguyla başlıyorum.', category: 'happiness', reversed: false },
  { id: 4, text: 'Küçük şeylere şükredebildiğimi ve zevk alabildiğimi düşünüyorum.', category: 'happiness', reversed: false },
  { id: 5, text: 'Genel olarak hayatımdan memnunum.', category: 'happiness', reversed: false },
  { id: 6, text: 'Gülümsüyor ve gülüyorum sıklıkla.', category: 'happiness', reversed: false },

  // Anlam & Amaç (6 soru)
  { id: 7, text: 'Hayatımın bir amacı ve anlamı olduğunu hissediyorum.', category: 'meaning', reversed: false },
  { id: 8, text: 'Yaptığım işler benden büyük bir şeye hizmet ediyor.', category: 'meaning', reversed: false },
  { id: 9, text: 'Değerlerime uygun bir yaşam sürüyorum.', category: 'meaning', reversed: false },
  { id: 10, text: 'Başkalarına katkı sağladığımı hissediyorum.', category: 'meaning', reversed: false },
  { id: 11, text: 'Geleceğe dair umut verici hedeflerim var.', category: 'meaning', reversed: false },
  { id: 12, text: 'Hayatımın yönü ve rotası konusunda netim.', category: 'meaning', reversed: false },

  // Başarı & Kariyer (6 soru)
  { id: 13, text: 'Profesyonel hayatımda ilerleme kaydediyorum.', category: 'achievement', reversed: false },
  { id: 14, text: 'İşimde başarı ve tatmin duygusu yaşıyorum.', category: 'achievement', reversed: false },
  { id: 15, text: 'Hedeflerime doğru istikrarlı adımlar atıyorum.', category: 'achievement', reversed: false },
  { id: 16, text: 'Yeteneklerimi ve becerilerimi kullanabildiğimi hissediyorum.', category: 'achievement', reversed: false },
  { id: 17, text: 'Kariyerimde olduğum yerden memnunum.', category: 'achievement', reversed: false },
  { id: 18, text: 'Zorluklar karşısında azimle devam edebiliyorum.', category: 'achievement', reversed: false },

  // İlişkiler & Sosyal Bağ (6 soru)
  { id: 19, text: 'Hayatımda beni anlayan ve destekleyen insanlar var.', category: 'relationships', reversed: false },
  { id: 20, text: 'Ailemle ilişkilerim tatmin edici.', category: 'relationships', reversed: false },
  { id: 21, text: 'Gerçek ve derin arkadaşlıklarım var.', category: 'relationships', reversed: false },
  { id: 22, text: 'İhtiyacım olduğunda güvenebileceğim insanlar var.', category: 'relationships', reversed: false },
  { id: 23, text: 'Sosyal çevremi genişletmekte ve sürdürmekte başarılıyım.', category: 'relationships', reversed: false },
  { id: 24, text: 'Sevdiklerimle kaliteli zaman geçiriyorum.', category: 'relationships', reversed: false },

  // Sağlık & Enerji (6 soru)
  { id: 25, text: 'Fiziksel sağlığım genel olarak iyi durumda.', category: 'health', reversed: false },
  { id: 26, text: 'Gün boyunca yeterli enerjim var.', category: 'health', reversed: false },
  { id: 27, text: 'Düzenli egzersiz yapıyorum veya fiziksel olarak aktifim.', category: 'health', reversed: false },
  { id: 28, text: 'Uyku kalitem ve süresi yeterli.', category: 'health', reversed: false },
  { id: 29, text: 'Sağlıklı beslenmeye dikkat ediyorum.', category: 'health', reversed: false },
  { id: 30, text: 'Bedenimi dinliyor ve ona iyi bakıyorum.', category: 'health', reversed: false },

  // Finansal Güvenlik (6 soru)
  { id: 31, text: 'Finansal durumum temel ihtiyaçlarımı karşılamaya yetiyor.', category: 'finance', reversed: false },
  { id: 32, text: 'Geleceğim için birikim yapabiliyorum.', category: 'finance', reversed: false },
  { id: 33, text: 'Para konusunda stres ve endişe duymuyorum.', category: 'finance', reversed: false },
  { id: 34, text: 'Harcamalarımı ve bütçemi kontrol altında tutabiliyorum.', category: 'finance', reversed: false },
  { id: 35, text: 'Beklenmedik masraflara karşı hazırlığım var.', category: 'finance', reversed: false },
  { id: 36, text: 'Finansal hedeflerime doğru ilerliyorum.', category: 'finance', reversed: false },

  // Kişisel Gelişim (6 soru)
  { id: 37, text: 'Sürekli yeni şeyler öğreniyor ve kendimi geliştiriyorum.', category: 'growth', reversed: false },
  { id: 38, text: 'Konfor alanımın dışına çıkmaya açığım.', category: 'growth', reversed: false },
  { id: 39, text: 'Potansiyelimi gerçekleştirme yolunda ilerliyorum.', category: 'growth', reversed: false },
  { id: 40, text: 'Kitap, kurs veya eğitimlerle kendime yatırım yapıyorum.', category: 'growth', reversed: false },
  { id: 41, text: 'Hatalarımdan ders çıkarıp büyüyorum.', category: 'growth', reversed: false },
  { id: 42, text: 'Bir yıl önceki halimle karşılaştırıldığımda gelişmişim.', category: 'growth', reversed: false },

  // Yaşam Dengesi (6 soru)
  { id: 43, text: 'İş ve özel hayatım arasında sağlıklı bir denge var.', category: 'balance', reversed: false },
  { id: 44, text: 'Kendime ve hobilerime yeterli zaman ayırabiliyorum.', category: 'balance', reversed: false },
  { id: 45, text: 'Zamanımı verimli ve dengeli yönetiyorum.', category: 'balance', reversed: false },
  { id: 46, text: 'İş dışında dinlenme ve yenilenme fırsatı buluyorum.', category: 'balance', reversed: false },
  { id: 47, text: 'Hayatımın farklı alanlarını ihmal etmeden yaşıyorum.', category: 'balance', reversed: false },
  { id: 48, text: 'Hayır demeyi ve sınır koymayı biliyorum.', category: 'balance', reversed: false },
];

// Likert ölçeği (1-10)
const LIKERT_OPTIONS = [
  { value: 1, label: '1', description: 'Hiç katılmıyorum' },
  { value: 2, label: '2', description: '' },
  { value: 3, label: '3', description: '' },
  { value: 4, label: '4', description: '' },
  { value: 5, label: '5', description: 'Kısmen katılıyorum' },
  { value: 6, label: '6', description: '' },
  { value: 7, label: '7', description: '' },
  { value: 8, label: '8', description: '' },
  { value: 9, label: '9', description: '' },
  { value: 10, label: '10', description: 'Tamamen katılıyorum' },
];

export default function LifeScoreTestPage() {
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
  const totalAnswered = Object.keys(answers).length;
  const categoryAnswered = categoryQuestions.filter(q => answers[q.id] !== undefined).length;
  const allCategoryAnswered = categoryAnswered === categoryQuestions.length;
  const progress = (totalAnswered / QUESTIONS.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (totalAnswered < QUESTIONS.length) {
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
        const score = q.reversed ? (11 - answer) : answer;
        scores[q.category].total += score;
        scores[q.category].count += 1;
      }
    });

    // Normalize (0-100)
    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count; // 1-10 arası
      normalizedScores[key] = Math.round(((avg - 1) / 9) * 100); // 0-100 arası
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
          alert('Seans limitinize ulaştınız. Daha fazla test için plan yükseltmeniz gerekiyor.');
          setSubmitting(false);
          router.push('/pricing');
          return;
        }
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // Sonuçları kaydet
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
      alert('Test kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  const handleStartTest = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmStart = () => {
    setShowConfirmModal(false);
    setShowIntro(false);
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
                PERMA + Psikolojik İyi Oluş + Yaşam Dengesi
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <h3 className="font-medium mb-3">Test Hakkında</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    48 soru, 8 yaşam alanı
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    Yaklaşık 10-12 dakika
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 shrink-0" />
                    Thorius&apos;a özel hibrit model
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20">
                <h3 className="font-medium mb-3 text-amber-600">8 Yaşam Alanı</h3>
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
                <h3 className="font-medium mb-2 text-purple-600">Akademik Altyapı</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• PERMA Modeli - Martin Seligman (2011)</li>
                  <li>• Psikolojik İyi Oluş - Carol Ryff (1989)</li>
                  <li>• Yaşam Doyumu Ölçeği - Ed Diener (1985)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Önemli Bilgi</p>
                    <p className="text-muted-foreground">
                      Bu test tamamlandığında seans hakkınızdan 1 adet düşülecektir.
                      Karşılığında detaylı AI raporu ve kişisel gelişim planı alacaksınız.
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
                    işlenmesine ilişkin aydınlatma metnini okudum ve kabul ediyorum.
                  </span>
                </label>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600"
              size="lg"
              disabled={!kvkkAccepted}
              onClick={handleStartTest}
            >
              Teste Başla
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <SessionConfirmModal
          isOpen={showConfirmModal}
          onConfirm={handleConfirmStart}
          onCancel={() => setShowConfirmModal(false)}
          type="test"
          title="Hayat Skoru Testi Başlatılacak"
          description="Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında 8 yaşam alanında detaylı AI analizi ve kişisel gelişim planı alacaksınız."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Genel Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Genel İlerleme
            </span>
            <span className="text-muted-foreground">
              {totalAnswered} / {QUESTIONS.length} soru
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

        {/* Kategori Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const catQuestions = QUESTIONS.filter(q => q.category === cat.id);
              const catAnswered = catQuestions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = catAnswered === catQuestions.length;
              const isCurrent = idx === currentCategoryIndex;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategoryIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'text-white shadow-lg'
                      : isComplete
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                  style={isCurrent ? { backgroundColor: cat.color } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {cat.nameShort}
                  {isComplete && !isCurrent && <CheckCircle2 className="h-3 w-3" />}
                  {!isComplete && !isCurrent && (
                    <span className="text-xs opacity-70">({catAnswered}/{catQuestions.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kategori Başlık */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentCategory.color}20` }}
                >
                  {(() => {
                    const Icon = currentCategory.icon;
                    return <Icon className="h-7 w-7" style={{ color: currentCategory.color }} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentCategory.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Bu alandaki ilerleme: {categoryAnswered} / {categoryQuestions.length}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${currentCategory.color}20`, color: currentCategory.color }}
                >
                  {currentCategory.academic}
                </span>
              </div>
            </div>

            {/* Sorular */}
            <div className="space-y-4">
              {categoryQuestions.map((question, idx) => (
                <div
                  key={question.id}
                  className={`bg-card rounded-xl border p-5 transition-all ${
                    answers[question.id] !== undefined
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: `${currentCategory.color}20`, color: currentCategory.color }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium pt-0.5">{question.text}</p>
                  </div>

                  {/* 1-10 Rating */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Hiç katılmıyorum</span>
                      <span>Tamamen katılıyorum</span>
                    </div>
                    <div className="flex gap-1.5">
                      {LIKERT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(question.id, option.value)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            answers[question.id] === option.value
                              ? 'text-white shadow-md scale-105'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                          style={
                            answers[question.id] === option.value
                              ? { backgroundColor: currentCategory.color }
                              : {}
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrevCategory}
            disabled={currentCategoryIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Önceki Alan
          </Button>

          {currentCategoryIndex < CATEGORIES.length - 1 ? (
            <Button
              onClick={handleNextCategory}
              disabled={!allCategoryAnswered}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Sonraki Alan
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={totalAnswered < QUESTIONS.length || submitting}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
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

        {/* Uyarı */}
        {!allCategoryAnswered && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sonraki alana geçmek için bu alandaki tüm soruları cevaplayın
          </p>
        )}
      </div>
    </main>
  );
}
