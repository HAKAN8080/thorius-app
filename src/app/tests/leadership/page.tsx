'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, AlertCircle,
  Loader2, CheckCircle2, Crown, Lightbulb, Heart, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionConfirmModal } from '@/components/SessionConfirmModal';

// Liderlik Tarzları - Akademik Temeller
// Bass & Avolio (1994) - MLQ (Multifactor Leadership Questionnaire)
// Burns (1978) - Transformational & Transactional Leadership
// Greenleaf (1970) - Servant Leadership
// Sashkin (1988), Nanus (1992) - Visionary Leadership

const LEADERSHIP_STYLES = [
  {
    id: 'transformational',
    name: 'Dönüşümcü Liderlik',
    nameEn: 'Transformational Leadership',
    color: '#8B5CF6',
    icon: Lightbulb,
    description: 'İlham verme, motive etme ve takım üyelerini dönüştürme',
    academic: 'Bass & Avolio (1994), Burns (1978)',
    characteristics: [
      'İdealleştirilmiş Etki (Karizmatik)',
      'İlham Verici Motivasyon',
      'Entelektüel Uyarım',
      'Bireysel İlgi'
    ],
  },
  {
    id: 'transactional',
    name: 'İşlemci Liderlik',
    nameEn: 'Transactional Leadership',
    color: '#06B6D4',
    icon: Target,
    description: 'Hedef odaklı, ödül-performans temelli yönetim',
    academic: 'Bass (1985), Burns (1978)',
    characteristics: [
      'Koşullu Ödüllendirme',
      'İstisna ile Yönetim',
      'Performans Takibi',
      'Standartlara Uyum'
    ],
  },
  {
    id: 'servant',
    name: 'Hizmetkar Liderlik',
    nameEn: 'Servant Leadership',
    color: '#10B981',
    icon: Heart,
    description: 'Takıma hizmet etme, gelişimlerini önceleme',
    academic: 'Greenleaf (1970), Spears (1995)',
    characteristics: [
      'Dinleme ve Empati',
      'Farkındalık',
      'İkna Etme',
      'Topluluk Oluşturma'
    ],
  },
  {
    id: 'visionary',
    name: 'Vizyoner Liderlik',
    nameEn: 'Visionary Leadership',
    color: '#F59E0B',
    icon: Crown,
    description: 'Geleceği görme, vizyon oluşturma ve yön belirleme',
    academic: 'Sashkin (1988), Nanus (1992)',
    characteristics: [
      'Net Vizyon',
      'Stratejik Düşünme',
      'İnovasyon Odaklılık',
      'Değişim Yönetimi'
    ],
  },
];

// 48 Soru - Her liderlik tarzında 12 soru
const QUESTIONS: { id: number; text: string; style: string }[] = [
  // Dönüşümcü Liderlik (12 soru)
  { id: 1, text: 'Ekip üyelerimin potansiyellerini keşfetmelerine ve geliştirmelerine yardımcı olurum.', style: 'transformational' },
  { id: 2, text: 'İnsanlara ilham vererek onları motive etmeyi tercih ederim.', style: 'transformational' },
  { id: 3, text: 'Ekibimi düşünmeye ve kalıpların dışına çıkmaya teşvik ederim.', style: 'transformational' },
  { id: 4, text: 'Her ekip üyesinin bireysel ihtiyaçlarını anlamaya çalışırım.', style: 'transformational' },
  { id: 5, text: 'Değerlerim ve inançlarım ekibim için rol model oluşturur.', style: 'transformational' },
  { id: 6, text: 'Heyecan verici bir gelecek tablosu çizerek insanları harekete geçiririm.', style: 'transformational' },
  { id: 7, text: 'Yeni bakış açıları sunarak mevcut varsayımları sorgulatırım.', style: 'transformational' },
  { id: 8, text: 'Ekip üyelerinin kariyer gelişimine özel ilgi gösteririm.', style: 'transformational' },
  { id: 9, text: 'Zorlu hedefler belirleyerek ekibimin sınırlarını zorlamasını sağlarım.', style: 'transformational' },
  { id: 10, text: 'Tutkulu ve kararlı bir şekilde hedeflerimizi anlatırım.', style: 'transformational' },
  { id: 11, text: 'Yaratıcı çözümler için risk almayı desteklerim.', style: 'transformational' },
  { id: 12, text: 'Her bireyin güçlü yönlerini keşfedip kullanmasına yardımcı olurum.', style: 'transformational' },

  // İşlemci Liderlik (12 soru)
  { id: 13, text: 'Net hedefler ve beklentiler belirlemeyi önemserim.', style: 'transactional' },
  { id: 14, text: 'Başarılı performansı somut ödüllerle takdir ederim.', style: 'transactional' },
  { id: 15, text: 'Standartlardan sapmaları hemen tespit edip düzeltirim.', style: 'transactional' },
  { id: 16, text: 'İş süreçlerinin verimli ve düzenli işlemesini sağlarım.', style: 'transactional' },
  { id: 17, text: 'Performans hedeflerine ulaşma konusunda takipçiyimdir.', style: 'transactional' },
  { id: 18, text: 'Açık kurallar ve prosedürler oluşturmayı tercih ederim.', style: 'transactional' },
  { id: 19, text: 'Hataları önlemek için sistemler ve kontroller kurarım.', style: 'transactional' },
  { id: 20, text: 'Kararlarımı verilere ve ölçülebilir sonuçlara dayandırırım.', style: 'transactional' },
  { id: 21, text: 'Görevlerin zamanında ve standartlara uygun tamamlanmasını beklerim.', style: 'transactional' },
  { id: 22, text: 'Ekip üyelerine net sorumluluklar ve yetki sınırları tanımlarım.', style: 'transactional' },
  { id: 23, text: 'Performans değerlendirmelerini objektif kriterlere göre yaparım.', style: 'transactional' },
  { id: 24, text: 'Hedeflere ulaşıldığında vaat edilen ödülleri veririm.', style: 'transactional' },

  // Hizmetkar Liderlik (12 soru)
  { id: 25, text: 'Ekip üyelerimin ihtiyaçlarını kendi ihtiyaçlarımın önüne koyarım.', style: 'servant' },
  { id: 26, text: 'Dinlemeye konuşmaktan daha fazla zaman ayırırım.', style: 'servant' },
  { id: 27, text: 'Ekip üyelerinin kişisel ve profesyonel gelişimini desteklerim.', style: 'servant' },
  { id: 28, text: 'Güven ortamı oluşturmak için şeffaf ve dürüst davranırım.', style: 'servant' },
  { id: 29, text: 'Başkalarının bakış açılarını anlamak için empati kurarım.', style: 'servant' },
  { id: 30, text: 'Kararları dayatmak yerine ikna yoluyla etkilemeyi tercih ederim.', style: 'servant' },
  { id: 31, text: 'Ekip üyelerinin özerkliğini ve karar alma yetkisini desteklerim.', style: 'servant' },
  { id: 32, text: 'Topluluk ruhu ve aidiyet duygusu oluşturmaya önem veririm.', style: 'servant' },
  { id: 33, text: 'Ekip üyelerinin hatalarını öğrenme fırsatı olarak görürüm.', style: 'servant' },
  { id: 34, text: 'Alçakgönüllülükle liderlik etmeyi değerli bulurum.', style: 'servant' },
  { id: 35, text: 'Ekibimin refahı ve mutluluğu benim için önceliklidir.', style: 'servant' },
  { id: 36, text: 'Başkalarının başarısına yardımcı olmak beni motive eder.', style: 'servant' },

  // Vizyoner Liderlik (12 soru)
  { id: 37, text: 'Uzun vadeli hedefler ve büyük resim üzerinde düşünürüm.', style: 'visionary' },
  { id: 38, text: 'Geleceği öngörerek stratejik planlar yaparım.', style: 'visionary' },
  { id: 39, text: 'Yenilikçi fikirleri ve değişimi desteklerim.', style: 'visionary' },
  { id: 40, text: 'Vizyonumu net ve ikna edici şekilde iletebilirim.', style: 'visionary' },
  { id: 41, text: 'Belirsizlik ortamında bile kararlılıkla yön belirlerim.', style: 'visionary' },
  { id: 42, text: 'Sektördeki trendleri ve değişimleri yakından takip ederim.', style: 'visionary' },
  { id: 43, text: 'Organizasyonun geleceğini şekillendirmeyi hedeflerim.', style: 'visionary' },
  { id: 44, text: 'Risk alarak yeni fırsatları değerlendiririm.', style: 'visionary' },
  { id: 45, text: 'Mevcut durumu sorgulayarak daha iyi alternatifleri ararım.', style: 'visionary' },
  { id: 46, text: 'İlham verici bir gelecek vizyonu oluşturmakta başarılıyımdır.', style: 'visionary' },
  { id: 47, text: 'Değişimi fırsat olarak görür ve yönetirim.', style: 'visionary' },
  { id: 48, text: 'Stratejik düşünme ve planlama güçlü yönlerimdendir.', style: 'visionary' },
];

// Likert ölçeği (1-5)
const LIKERT_OPTIONS = [
  { value: 1, label: '1', description: 'Kesinlikle Katılmıyorum' },
  { value: 2, label: '2', description: 'Katılmıyorum' },
  { value: 3, label: '3', description: 'Kararsızım' },
  { value: 4, label: '4', description: 'Katılıyorum' },
  { value: 5, label: '5', description: 'Kesinlikle Katılıyorum' },
];

export default function LeadershipTestPage() {
  const router = useRouter();
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentStyle = LEADERSHIP_STYLES[currentStyleIndex];
  const styleQuestions = QUESTIONS.filter(q => q.style === currentStyle.id);
  const totalAnswered = Object.keys(answers).length;
  const styleAnswered = styleQuestions.filter(q => answers[q.id] !== undefined).length;
  const allStyleAnswered = styleAnswered === styleQuestions.length;
  const progress = (totalAnswered / QUESTIONS.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextStyle = () => {
    if (currentStyleIndex < LEADERSHIP_STYLES.length - 1) {
      setCurrentStyleIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStyle = () => {
    if (currentStyleIndex > 0) {
      setCurrentStyleIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (totalAnswered < QUESTIONS.length) {
      alert('Lütfen tüm soruları cevaplayın.');
      return;
    }

    setSubmitting(true);

    // Her liderlik tarzı için skorları hesapla
    const scores: Record<string, { total: number; count: number }> = {};
    LEADERSHIP_STYLES.forEach(style => {
      scores[style.id] = { total: 0, count: 0 };
    });

    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        scores[q.style].total += answer;
        scores[q.style].count += 1;
      }
    });

    // Normalize (0-100)
    const normalizedScores: Record<string, number> = {};
    Object.entries(scores).forEach(([key, val]) => {
      const avg = val.total / val.count; // 1-5 arası
      normalizedScores[key] = Math.round(((avg - 1) / 4) * 100); // 0-100 arası
    });

    // Dominant liderlik tarzını bul
    const dominantStyle = Object.entries(normalizedScores)
      .sort(([, a], [, b]) => b - a)[0][0];
    normalizedScores['dominant'] = LEADERSHIP_STYLES.findIndex(s => s.id === dominantStyle);

    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    try {
      const response = await fetch('/api/tests/use-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'leadership',
          testName: 'Liderlik Tarzı Envanteri',
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
        type: 'leadership',
        answers,
        scores: normalizedScores,
        dominantStyle,
        completedAt: new Date().toISOString(),
        duration,
      };

      localStorage.setItem('lastLeadershipResult', JSON.stringify(testResult));
      window.dispatchEvent(new Event('auth-change'));
      router.push(`/tests/leadership/result?id=${testResult.id}`);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Liderlik Tarzı Envanteri</h1>
              <p className="text-muted-foreground text-sm">
                Dönüşümcü, İşlemci, Hizmetkar veya Vizyoner Liderlik
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <h3 className="font-medium mb-3">Test Hakkında</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    48 soru, 4 liderlik tarzı
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    Yaklaşık 10-15 dakika
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500 shrink-0" />
                    Dominant liderlik tarzınızı keşfedin
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20">
                <h3 className="font-medium mb-3 text-violet-600">4 Liderlik Tarzı</h3>
                <div className="grid grid-cols-2 gap-3">
                  {LEADERSHIP_STYLES.map(style => {
                    const Icon = style.icon;
                    return (
                      <div key={style.id} className="flex items-start gap-2 text-sm">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${style.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: style.color }} />
                        </div>
                        <div>
                          <span className="font-medium block">{style.name}</span>
                          <span className="text-xs text-muted-foreground">{style.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-medium mb-2 text-purple-600">Akademik Altyapı</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Dönüşümcü Liderlik - Bass & Avolio (1994), Burns (1978)</li>
                  <li>• İşlemci Liderlik - Bass (1985), Burns (1978)</li>
                  <li>• Hizmetkar Liderlik - Greenleaf (1970), Spears (1995)</li>
                  <li>• Vizyoner Liderlik - Sashkin (1988), Nanus (1992)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Önemli Bilgi</p>
                    <p className="text-muted-foreground">
                      Bu test tamamlandığında seans hakkınızdan 1 adet düşülecektir.
                      Karşılığında detaylı liderlik profili ve AI analizi alacaksınız.
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
              className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600"
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
          title="Liderlik Testi Başlatılacak"
          description="Bu testi tamamladığınızda seans hakkınızdan 1 adet düşülecektir. Karşılığında liderlik tarzınızın detaylı analizi ve gelişim önerileri alacaksınız."
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
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Liderlik Tarzı Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {LEADERSHIP_STYLES.map((style, idx) => {
              const Icon = style.icon;
              const sQuestions = QUESTIONS.filter(q => q.style === style.id);
              const sAnswered = sQuestions.filter(q => answers[q.id] !== undefined).length;
              const isComplete = sAnswered === sQuestions.length;
              const isCurrent = idx === currentStyleIndex;

              return (
                <button
                  key={style.id}
                  onClick={() => setCurrentStyleIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'text-white shadow-lg'
                      : isComplete
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                  style={isCurrent ? { backgroundColor: style.color } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {style.name.split(' ')[0]}
                  {isComplete && !isCurrent && <CheckCircle2 className="h-3 w-3" />}
                  {!isComplete && !isCurrent && (
                    <span className="text-xs opacity-70">({sAnswered}/{sQuestions.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Liderlik Tarzı Başlık */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStyle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentStyle.color}20` }}
                >
                  {(() => {
                    const Icon = currentStyle.icon;
                    return <Icon className="h-7 w-7" style={{ color: currentStyle.color }} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentStyle.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentStyle.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentStyle.characteristics.map((char, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${currentStyle.color}15`, color: currentStyle.color }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Bu alandaki ilerleme: {styleAnswered} / {styleQuestions.length}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${currentStyle.color}20`, color: currentStyle.color }}
                >
                  {currentStyle.academic}
                </span>
              </div>
            </div>

            {/* Sorular */}
            <div className="space-y-4">
              {styleQuestions.map((question, idx) => (
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
                      style={{ backgroundColor: `${currentStyle.color}20`, color: currentStyle.color }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium pt-0.5">{question.text}</p>
                  </div>

                  {/* Likert Scale */}
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
                            answers[question.id] === option.value
                              ? 'text-white shadow-md scale-105'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                          style={
                            answers[question.id] === option.value
                              ? { backgroundColor: currentStyle.color }
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
            onClick={handlePrevStyle}
            disabled={currentStyleIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Önceki Tarz
          </Button>

          {currentStyleIndex < LEADERSHIP_STYLES.length - 1 ? (
            <Button
              onClick={handleNextStyle}
              disabled={!allStyleAnswered}
              className="bg-gradient-to-r from-violet-500 to-purple-500"
            >
              Sonraki Tarz
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={totalAnswered < QUESTIONS.length || submitting}
              className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
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
        {!allStyleAnswered && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sonraki tarza geçmek için bu alandaki tüm soruları cevaplayın
          </p>
        )}
      </div>
    </main>
  );
}
