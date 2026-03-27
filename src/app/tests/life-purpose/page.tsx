'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Compass, Flame, Heart, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';

// Yaşam Amacı & Yön Testi - Akademik Temeller
// Viktor Frankl - Logotherapy (Man's Search for Meaning)
// Purpose in Life Test (PIL) - Crumbaugh & Maholick (1964)
// Meaning in Life Questionnaire (MLQ) - Steger (2006)

const PURPOSE_DIMENSIONS = [
  {
    id: 'meaning',
    name: 'Anlam Duygusu',
    nameEn: 'Sense of Meaning',
    color: '#8B5CF6',
    icon: Sparkles,
    description: 'Hayatın anlamlı ve değerli hissedilmesi',
    academic: 'Frankl (1959)',
  },
  {
    id: 'direction',
    name: 'Hayat Yönü',
    nameEn: 'Life Direction',
    color: '#06B6D4',
    icon: Compass,
    description: 'Net hedefler ve yaşam rotası',
    academic: 'PIL Test',
  },
  {
    id: 'motivation',
    name: 'İçsel Motivasyon',
    nameEn: 'Intrinsic Motivation',
    color: '#F59E0B',
    icon: Flame,
    description: 'İçten gelen itici güç ve tutku',
    academic: 'SDT - Deci & Ryan',
  },
  {
    id: 'connection',
    name: 'Bağlantı & Katkı',
    nameEn: 'Connection & Contribution',
    color: '#10B981',
    icon: Heart,
    description: 'Başkalarına katkı ve toplumsal bağ',
    academic: 'MLQ - Steger',
  },
];

// 32 Soru - Her boyutta 8 soru
const QUESTIONS: { id: number; text: string; dimension: string; reversed: boolean }[] = [
  // Anlam Duygusu (8 soru)
  { id: 1, text: 'Hayatımın bir anlamı ve amacı olduğunu hissediyorum.', dimension: 'meaning', reversed: false },
  { id: 2, text: 'Her gün uyanmak için bir nedenim var.', dimension: 'meaning', reversed: false },
  { id: 3, text: 'Yaşadığım deneyimlerin bir değeri olduğuna inanıyorum.', dimension: 'meaning', reversed: false },
  { id: 4, text: 'Hayatım boş ve anlamsız geliyor.', dimension: 'meaning', reversed: true },
  { id: 5, text: 'Yaptığım işlerin bir önemi olduğunu düşünüyorum.', dimension: 'meaning', reversed: false },
  { id: 6, text: 'Acı çekmenin bile bir anlamı olabileceğine inanıyorum.', dimension: 'meaning', reversed: false },
  { id: 7, text: 'Hayatımda değerli bulduğum şeyler var.', dimension: 'meaning', reversed: false },
  { id: 8, text: 'Kendimi evrenin anlamlı bir parçası olarak görüyorum.', dimension: 'meaning', reversed: false },

  // Hayat Yönü (8 soru)
  { id: 9, text: 'Hayatta ne istediğimi biliyorum.', dimension: 'direction', reversed: false },
  { id: 10, text: 'Uzun vadeli hedeflerim var ve bunlara doğru ilerliyorum.', dimension: 'direction', reversed: false },
  { id: 11, text: 'Nereye gittiğimi bilmeden yaşıyormuşum gibi hissediyorum.', dimension: 'direction', reversed: true },
  { id: 12, text: 'Hayatımın yönü konusunda netim.', dimension: 'direction', reversed: false },
  { id: 13, text: 'Kararlarım tutarlı bir vizyona dayanıyor.', dimension: 'direction', reversed: false },
  { id: 14, text: 'Gelecek hakkında heyecan verici planlarım var.', dimension: 'direction', reversed: false },
  { id: 15, text: 'Hayatım plansız ve rastgele akıyor.', dimension: 'direction', reversed: true },
  { id: 16, text: 'Önceliklerimi net bir şekilde belirleyebiliyorum.', dimension: 'direction', reversed: false },

  // İçsel Motivasyon (8 soru)
  { id: 17, text: 'Yaptığım işlerden içsel bir tatmin duyuyorum.', dimension: 'motivation', reversed: false },
  { id: 18, text: 'Tutkulu olduğum alanlar var.', dimension: 'motivation', reversed: false },
  { id: 19, text: 'Sabahları hevesle uyanıyorum.', dimension: 'motivation', reversed: false },
  { id: 20, text: 'Kendimi zorlamadan doğal olarak motive olabiliyorum.', dimension: 'motivation', reversed: false },
  { id: 21, text: 'Yaptığım işler beni enerjik kılıyor.', dimension: 'motivation', reversed: false },
  { id: 22, text: 'Dışsal ödüller olmasa bile çalışmaya devam ederim.', dimension: 'motivation', reversed: false },
  { id: 23, text: 'İşime veya hobime saat geçtikçe dalarım.', dimension: 'motivation', reversed: false },
  { id: 24, text: 'Hiçbir şey beni gerçekten heyecanlandırmıyor.', dimension: 'motivation', reversed: true },

  // Bağlantı & Katkı (8 soru)
  { id: 25, text: 'Başkalarının hayatına olumlu katkı sağlıyorum.', dimension: 'connection', reversed: false },
  { id: 26, text: 'Topluma faydalı biri olduğumu hissediyorum.', dimension: 'connection', reversed: false },
  { id: 27, text: 'Benden sonra bir şeyler bırakmak istiyorum (miras, etki).', dimension: 'connection', reversed: false },
  { id: 28, text: 'İnsanlarla derin bağlar kurabilirim.', dimension: 'connection', reversed: false },
  { id: 29, text: 'Bir topluluğa ait olduğumu hissediyorum.', dimension: 'connection', reversed: false },
  { id: 30, text: 'Başkalarına yardım etmek beni mutlu ediyor.', dimension: 'connection', reversed: false },
  { id: 31, text: 'Yaptıklarım sadece beni değil başkalarını da etkiliyor.', dimension: 'connection', reversed: false },
  { id: 32, text: 'Kendimden daha büyük bir şeye hizmet ediyorum.', dimension: 'connection', reversed: false },
];

const LIKERT_OPTIONS = [
  { value: 1, label: '1', description: 'Kesinlikle Katılmıyorum' },
  { value: 2, label: '2', description: 'Katılmıyorum' },
  { value: 3, label: '3', description: 'Kararsızım' },
  { value: 4, label: '4', description: 'Katılıyorum' },
  { value: 5, label: '5', description: 'Kesinlikle Katılıyorum' },
];

export default function LifePurposeTestPage() {
  const router = useRouter();
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentDimension = PURPOSE_DIMENSIONS[currentDimensionIndex];
  const dimensionQuestions = QUESTIONS.filter(q => q.dimension === currentDimension.id);
  const totalAnswered = Object.keys(answers).length;
  const dimensionAnswered = dimensionQuestions.filter(q => answers[q.id] !== undefined).length;
  const allDimensionAnswered = dimensionAnswered === dimensionQuestions.length;
  const progress = (totalAnswered / QUESTIONS.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextDimension = () => {
    if (currentDimensionIndex < PURPOSE_DIMENSIONS.length - 1) {
      setCurrentDimensionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevDimension = () => {
    if (currentDimensionIndex > 0) {
      setCurrentDimensionIndex(prev => prev - 1);
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
    PURPOSE_DIMENSIONS.forEach(d => { scores[d.id] = { total: 0, count: 0 }; });

    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const score = q.reversed ? (6 - answer) : answer;
        scores[q.dimension].total += score;
        scores[q.dimension].count += 1;
      }
    });

    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count;
      normalizedScores[key] = Math.round(((avg - 1) / 4) * 100);
    });

    const totalScore = Object.values(normalizedScores).reduce((a, b) => a + b, 0);
    normalizedScores['overall'] = Math.round(totalScore / Object.keys(normalizedScores).length);

    const overall = normalizedScores['overall'];
    const level = overall >= 75 ? 'high' : overall >= 50 ? 'moderate' : overall >= 25 ? 'searching' : 'low';

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'life-purpose',
          testName: 'Yaşam Amacı & Yön Testi',
          scores: normalizedScores,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'SESSION_LIMIT_REACHED') {
          alert('Seans limitinize ulaştınız.');
          setSubmitting(false);
          router.push('/pricing');
          return;
        }
        throw new Error(data.error);
      }

      const testResult = {
        id: data.sessionId || Date.now().toString(),
        type: 'life-purpose',
        answers,
        scores: normalizedScores,
        level,
        completedAt: new Date().toISOString(),
        duration,
      };

      localStorage.setItem('lastLifePurposeResult', JSON.stringify(testResult));
      window.dispatchEvent(new Event('auth-change'));
      router.push(`/tests/life-purpose/result?id=${testResult.id}`);
    } catch (error) {
      console.error(error);
      alert('Bir hata oluştu');
      setSubmitting(false);
    }
  };

  if (showIntro) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
                <Compass className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Yaşam Amacı & Yön Testi</h1>
              <p className="text-muted-foreground text-sm">Viktor Frankl - Logotherapy</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <h3 className="font-medium mb-3">Test Hakkında</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />32 soru, 4 boyut</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" />10-12 dakika</li>
                  <li className="flex items-center gap-2"><Compass className="h-4 w-4 text-purple-500" />Hayatınıza yön verin</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20">
                <h3 className="font-medium mb-3 text-violet-600">4 Temel Boyut</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PURPOSE_DIMENSIONS.map(dim => {
                    const Icon = dim.icon;
                    return (
                      <div key={dim.id} className="flex items-start gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${dim.color}20` }}>
                          <Icon className="h-4 w-4" style={{ color: dim.color }} />
                        </div>
                        <div>
                          <span className="font-medium block">{dim.name}</span>
                          <span className="text-xs text-muted-foreground">{dim.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-medium mb-2 text-purple-600">Akademik Altyapı</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Logotherapy - Viktor Frankl (1959)</li>
                  <li>• Purpose in Life Test - Crumbaugh & Maholick (1964)</li>
                  <li>• Meaning in Life Questionnaire - Steger (2006)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Önemli Bilgi</p>
                    <p className="text-muted-foreground">Bu test tamamlandığında seans hakkınızdan 1 adet düşülecektir.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={kvkkAccepted} onChange={(e) => setKvkkAccepted(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border" />
                  <span className="text-sm text-muted-foreground"><strong className="text-foreground">KVKK:</strong> Kişisel verilerimin işlenmesini kabul ediyorum.</span>
                </label>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" size="lg" disabled={!kvkkAccepted} onClick={() => setShowConfirmModal(true)}>
              Teste Başla <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <SessionConfirmModal
          isOpen={showConfirmModal}
          onConfirm={() => { setShowConfirmModal(false); setShowIntro(false); }}
          onCancel={() => setShowConfirmModal(false)}
          type="test"
          title="Yaşam Amacı Testi Başlatılacak"
          description="Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında yaşam amacınız ve yön haritanız için detaylı analiz alacaksınız."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Genel İlerleme</span>
            <span className="text-muted-foreground">{totalAnswered} / {QUESTIONS.length}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {PURPOSE_DIMENSIONS.map((dim, idx) => {
              const Icon = dim.icon;
              const dQuestions = QUESTIONS.filter(q => q.dimension === dim.id);
              const dAnswered = dQuestions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = dAnswered === dQuestions.length;
              const isCurrent = idx === currentDimensionIndex;
              return (
                <button key={dim.id} onClick={() => setCurrentDimensionIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isCurrent ? 'text-white shadow-lg' : isComplete ? 'bg-green-500/20 text-green-600' : 'bg-muted hover:bg-muted-foreground/20'}`}
                  style={isCurrent ? { backgroundColor: dim.color } : {}}>
                  <Icon className="h-4 w-4" />{dim.name}
                  {isComplete && !isCurrent && <CheckCircle2 className="h-3 w-3" />}
                  {!isComplete && !isCurrent && <span className="text-xs opacity-70">({dAnswered}/{dQuestions.length})</span>}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentDimension.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentDimension.color}20` }}>
                  {(() => { const Icon = currentDimension.icon; return <Icon className="h-7 w-7" style={{ color: currentDimension.color }} />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentDimension.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentDimension.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {dimensionQuestions.map((question, idx) => (
                <div key={question.id} className={`bg-card rounded-xl border p-5 transition-all ${answers[question.id] !== undefined ? 'border-green-500/50 bg-green-500/5' : 'border-border'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${currentDimension.color}20`, color: currentDimension.color }}>{idx + 1}</span>
                    <p className="text-base font-medium pt-0.5">{question.text}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Kesinlikle Katılmıyorum</span>
                      <span>Kesinlikle Katılıyorum</span>
                    </div>
                    <div className="flex gap-2">
                      {LIKERT_OPTIONS.map((option) => (
                        <button key={option.value} onClick={() => handleAnswer(question.id, option.value)}
                          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${answers[question.id] === option.value ? 'text-white shadow-md scale-105' : 'bg-muted hover:bg-muted-foreground/20'}`}
                          style={answers[question.id] === option.value ? { backgroundColor: currentDimension.color } : {}}>
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

        <div className="flex items-center justify-between gap-4 mt-8">
          <Button variant="outline" onClick={handlePrevDimension} disabled={currentDimensionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />Önceki
          </Button>
          {currentDimensionIndex < PURPOSE_DIMENSIONS.length - 1 ? (
            <Button onClick={handleNextDimension} disabled={!allDimensionAnswered} className="bg-gradient-to-r from-violet-500 to-purple-500">
              Sonraki<ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={totalAnswered < QUESTIONS.length || submitting} className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Hesaplanıyor...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Testi Tamamla</>}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
