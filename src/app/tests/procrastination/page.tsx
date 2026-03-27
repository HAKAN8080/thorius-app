'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Timer, Zap, Shield, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';

// Erteleme Profili - Akademik Temeller
// Piers Steel (2007) - The Nature of Procrastination
// Temporal Motivation Theory (TMT)
// Lay (1986) - General Procrastination Scale

const PROCRASTINATION_FACTORS = [
  {
    id: 'starting',
    name: 'Başlama Direnci',
    nameEn: 'Task Initiation',
    color: '#EF4444',
    icon: Zap,
    description: 'İşe başlamakta zorluk ve erteleme eğilimi',
    academic: 'Steel (2007)',
  },
  {
    id: 'perfectionism',
    name: 'Mükemmeliyetçilik',
    nameEn: 'Perfectionism',
    color: '#8B5CF6',
    icon: Target,
    description: 'Mükemmel olmama korkusu ve standartlar',
    academic: 'Flett & Hewitt',
  },
  {
    id: 'avoidance',
    name: 'Kaçınma Davranışı',
    nameEn: 'Task Avoidance',
    color: '#F59E0B',
    icon: Shield,
    description: 'Rahatsız edici görevlerden kaçınma',
    academic: 'Lay (1986)',
  },
  {
    id: 'time',
    name: 'Zaman Yönetimi',
    nameEn: 'Time Management',
    color: '#06B6D4',
    icon: Timer,
    description: 'Zamanı planlama ve kullanma becerisi',
    academic: 'TMT',
  },
];

// 28 Soru - Her faktörde 7 soru
const QUESTIONS: { id: number; text: string; factor: string; reversed: boolean }[] = [
  // Başlama Direnci (7 soru)
  { id: 1, text: 'Yapmam gereken işlere başlamakta zorlanırım.', factor: 'starting', reversed: false },
  { id: 2, text: 'Bir göreve başlamadan önce "biraz daha bekleyeyim" derim.', factor: 'starting', reversed: false },
  { id: 3, text: '"Yarın yaparım" cümlesi benim için sık kullandığım bir ifadedir.', factor: 'starting', reversed: false },
  { id: 4, text: 'İşe koyulmadan önce kendimi motive etmem uzun sürer.', factor: 'starting', reversed: false },
  { id: 5, text: 'Önemli görevleri son dakikaya bırakma eğilimindeyim.', factor: 'starting', reversed: false },
  { id: 6, text: 'Başlamak en zor kısımdır, bir kez başlayınca devam ederim.', factor: 'starting', reversed: false },
  { id: 7, text: 'Sabah kalktığımda yapılacak işlere başlamak için uzun süre beklerim.', factor: 'starting', reversed: false },

  // Mükemmeliyetçilik (7 soru)
  { id: 8, text: 'Bir işi mükemmel yapamayacaksam hiç başlamam daha iyi.', factor: 'perfectionism', reversed: false },
  { id: 9, text: 'Hata yapmaktan çok korkarım.', factor: 'perfectionism', reversed: false },
  { id: 10, text: 'Yaptığım işlerin her zaman en iyi olmasını beklerim.', factor: 'perfectionism', reversed: false },
  { id: 11, text: 'Başkalarının beni eleştirmesi beni çok etkiler.', factor: 'perfectionism', reversed: false },
  { id: 12, text: 'Ortalamanın üstünde olmayan sonuçlar beni hayal kırıklığına uğratır.', factor: 'perfectionism', reversed: false },
  { id: 13, text: 'Mükemmel koşulları beklerim işe başlamak için.', factor: 'perfectionism', reversed: false },
  { id: 14, text: 'Yeterince iyi olmadığımı düşündüğüm için bazı fırsatları kaçırırım.', factor: 'perfectionism', reversed: false },

  // Kaçınma Davranışı (7 soru)
  { id: 15, text: 'Zor veya sıkıcı görevleri yapmak yerine başka şeylerle uğraşırım.', factor: 'avoidance', reversed: false },
  { id: 16, text: 'Stresli işleri düşünmek yerine dikkatimi başka yere çeviririm.', factor: 'avoidance', reversed: false },
  { id: 17, text: 'Hoşuma gitmeyen görevleri görmezden gelmeye çalışırım.', factor: 'avoidance', reversed: false },
  { id: 18, text: 'Rahatsız edici konularla yüzleşmekten kaçınırım.', factor: 'avoidance', reversed: false },
  { id: 19, text: 'Kendimi eğlenceli ama gereksiz aktivitelerle oyalarım.', factor: 'avoidance', reversed: false },
  { id: 20, text: 'Sosyal medya veya internet beni önemli işlerden uzaklaştırır.', factor: 'avoidance', reversed: false },
  { id: 21, text: 'Önemli bir iş varken bile gevşemeyi tercih ederim.', factor: 'avoidance', reversed: false },

  // Zaman Yönetimi (7 soru - reversed: iyi yönetim = düşük erteleme)
  { id: 22, text: 'Günlük ve haftalık planlarım vardır ve bunlara uyarım.', factor: 'time', reversed: true },
  { id: 23, text: 'Deadlineları rahatça yetiştiririm.', factor: 'time', reversed: true },
  { id: 24, text: 'Zamanımı etkili kullandığımı düşünüyorum.', factor: 'time', reversed: true },
  { id: 25, text: 'Görevleri öncelik sırasına koyabilirim.', factor: 'time', reversed: true },
  { id: 26, text: 'Bir işin ne kadar süreceğini doğru tahmin edebilirim.', factor: 'time', reversed: true },
  { id: 27, text: 'Takvim ve hatırlatıcıları düzenli kullanırım.', factor: 'time', reversed: true },
  { id: 28, text: 'Uzun vadeli hedeflerimi küçük adımlara bölebilirim.', factor: 'time', reversed: true },
];

const LIKERT_OPTIONS = [
  { value: 1, label: '1', description: 'Kesinlikle Katılmıyorum' },
  { value: 2, label: '2', description: 'Katılmıyorum' },
  { value: 3, label: '3', description: 'Kararsızım' },
  { value: 4, label: '4', description: 'Katılıyorum' },
  { value: 5, label: '5', description: 'Kesinlikle Katılıyorum' },
];

export default function ProcrastinationTestPage() {
  const router = useRouter();
  const [currentFactorIndex, setCurrentFactorIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentFactor = PROCRASTINATION_FACTORS[currentFactorIndex];
  const factorQuestions = QUESTIONS.filter(q => q.factor === currentFactor.id);
  const totalAnswered = Object.keys(answers).length;
  const factorAnswered = factorQuestions.filter(q => answers[q.id] !== undefined).length;
  const allFactorAnswered = factorAnswered === factorQuestions.length;
  const progress = (totalAnswered / QUESTIONS.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextFactor = () => {
    if (currentFactorIndex < PROCRASTINATION_FACTORS.length - 1) {
      setCurrentFactorIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevFactor = () => {
    if (currentFactorIndex > 0) {
      setCurrentFactorIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (totalAnswered < QUESTIONS.length) {
      alert('Lütfen tüm soruları cevaplayın.');
      return;
    }

    setSubmitting(true);

    const scores: Record<string, { total: number; count: number }> = {};
    PROCRASTINATION_FACTORS.forEach(f => {
      scores[f.id] = { total: 0, count: 0 };
    });

    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const score = q.reversed ? (6 - answer) : answer;
        scores[q.factor].total += score;
        scores[q.factor].count += 1;
      }
    });

    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count;
      normalizedScores[key] = Math.round(((avg - 1) / 4) * 100);
    });

    // Genel erteleme skoru
    const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    normalizedScores['overall'] = Math.round(totalScore / Object.keys(normalizedScores).length);

    // Erteleme seviyesi belirleme
    const overall = normalizedScores['overall'];
    const level = overall >= 70 ? 'severe' : overall >= 50 ? 'moderate' : overall >= 30 ? 'mild' : 'low';

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'procrastination',
          testName: 'Erteleme Profili Testi',
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
        type: 'procrastination',
        answers,
        scores: normalizedScores,
        level,
        completedAt: new Date().toISOString(),
        duration,
      };

      localStorage.setItem('lastProcrastinationResult', JSON.stringify(testResult));
      window.dispatchEvent(new Event('auth-change'));
      router.push(`/tests/procrastination/result?id=${testResult.id}`);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
                <Timer className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Erteleme Profili Testi</h1>
              <p className="text-muted-foreground text-sm">
                Procrastination Assessment - Piers Steel
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <h3 className="font-medium mb-3">Test Hakkında</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    28 soru, 4 erteleme faktörü
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    Yaklaşık 8-10 dakika
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    Kişiselleştirilmiş aksiyon planı
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/20">
                <h3 className="font-medium mb-3 text-red-600">4 Erteleme Faktörü</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PROCRASTINATION_FACTORS.map(factor => {
                    const Icon = factor.icon;
                    return (
                      <div key={factor.id} className="flex items-start gap-2 text-sm">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${factor.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: factor.color }} />
                        </div>
                        <div>
                          <span className="font-medium block">{factor.name}</span>
                          <span className="text-xs text-muted-foreground">{factor.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <h3 className="font-medium mb-2 text-orange-600">Akademik Altyapı</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Temporal Motivation Theory - Piers Steel (2007)</li>
                  <li>• General Procrastination Scale - Lay (1986)</li>
                  <li>• Perfectionism & Procrastination - Flett & Hewitt</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Önemli Bilgi</p>
                    <p className="text-muted-foreground">
                      Bu test tamamlandığında seans hakkınızdan 1 adet düşülecektir.
                      Karşılığında erteleme profiliniz ve somut aksiyon planı alacaksınız.
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
              className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:via-orange-600 hover:to-amber-600"
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
          onConfirm={() => { setShowConfirmModal(false); setShowIntro(false); }}
          onCancel={() => setShowConfirmModal(false)}
          type="test"
          title="Erteleme Testi Başlatılacak"
          description="Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında erteleme profiliniz ve kişiselleştirilmiş aksiyon planı alacaksınız."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Genel İlerleme</span>
            <span className="text-muted-foreground">{totalAnswered} / {QUESTIONS.length} soru</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Factor Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {PROCRASTINATION_FACTORS.map((factor, idx) => {
              const Icon = factor.icon;
              const fQuestions = QUESTIONS.filter(q => q.factor === factor.id);
              const fAnswered = fQuestions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = fAnswered === fQuestions.length;
              const isCurrent = idx === currentFactorIndex;

              return (
                <button
                  key={factor.id}
                  onClick={() => setCurrentFactorIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isCurrent ? 'text-white shadow-lg' : isComplete ? 'bg-green-500/20 text-green-600' : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                  style={isCurrent ? { backgroundColor: factor.color } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {factor.name}
                  {isComplete && !isCurrent && <CheckCircle2 className="h-3 w-3" />}
                  {!isComplete && !isCurrent && <span className="text-xs opacity-70">({fAnswered}/{fQuestions.length})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Factor Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentFactor.color}20` }}>
                  {(() => { const Icon = currentFactor.icon; return <Icon className="h-7 w-7" style={{ color: currentFactor.color }} />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentFactor.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentFactor.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bu alandaki ilerleme: {factorAnswered} / {factorQuestions.length}</span>
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${currentFactor.color}20`, color: currentFactor.color }}>
                  {currentFactor.academic}
                </span>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {factorQuestions.map((question, idx) => (
                <div
                  key={question.id}
                  className={`bg-card rounded-xl border p-5 transition-all ${answers[question.id] !== undefined ? 'border-green-500/50 bg-green-500/5' : 'border-border'}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${currentFactor.color}20`, color: currentFactor.color }}>
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium pt-0.5">{question.text}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Kesinlikle Katılmıyorum</span>
                      <span>Kesinlikle Katılıyorum</span>
                    </div>
                    <div className="flex gap-2">
                      {LIKERT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(question.id, option.value)}
                          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                            answers[question.id] === option.value ? 'text-white shadow-md scale-105' : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                          style={answers[question.id] === option.value ? { backgroundColor: currentFactor.color } : {}}
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
          <Button variant="outline" onClick={handlePrevFactor} disabled={currentFactorIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Önceki
          </Button>
          {currentFactorIndex < PROCRASTINATION_FACTORS.length - 1 ? (
            <Button onClick={handleNextFactor} disabled={!allFactorAnswered} className="bg-gradient-to-r from-red-500 to-orange-500">
              Sonraki
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={totalAnswered < QUESTIONS.length || submitting} className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Hesaplanıyor...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Testi Tamamla</>}
            </Button>
          )}
        </div>
        {!allFactorAnswered && <p className="text-center text-sm text-muted-foreground mt-4">Sonraki alana geçmek için tüm soruları cevaplayın</p>}
      </div>
    </main>
  );
}
