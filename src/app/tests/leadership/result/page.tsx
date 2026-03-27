'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Crown, Lightbulb, Heart, Target, ArrowLeft, Download, Loader2,
  TrendingUp, Users, Briefcase, Star, Mail, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LEADERSHIP_STYLES = [
  {
    id: 'transformational',
    name: 'Dönüşümcü Lider',
    nameEn: 'Transformational Leader',
    color: '#8B5CF6',
    icon: Lightbulb,
    description: 'İlham veren, motive eden ve ekibini dönüştüren lider',
    strengths: [
      'Ekip üyelerini motive etme ve ilham verme',
      'Değişimi yönetme ve yenilikçi düşünce',
      'Bireysel gelişimi destekleme',
      'Güçlü vizyon ve hedef belirleme'
    ],
    developmentAreas: [
      'Detaylara ve süreçlere daha fazla dikkat',
      'Kısa vadeli hedefleri dengeleme',
      'Yapısal sistemler oluşturma',
      'Ölçülebilir metrikler belirleme'
    ],
    famousLeaders: ['Steve Jobs', 'Nelson Mandela', 'Oprah Winfrey'],
    quote: '"Liderlik, başkalarının potansiyelini ortaya çıkarmaktır." - Bill Bradley',
  },
  {
    id: 'transactional',
    name: 'İşlemci Lider',
    nameEn: 'Transactional Leader',
    color: '#06B6D4',
    icon: Target,
    description: 'Hedef odaklı, sonuç getiren ve sistematik lider',
    strengths: [
      'Net hedefler ve beklentiler belirleme',
      'Performans takibi ve değerlendirme',
      'Verimli süreçler oluşturma',
      'Tutarlı ve öngörülebilir yönetim'
    ],
    developmentAreas: [
      'Yaratıcılığa ve inovasyona alan açma',
      'Esnek ve adaptif yaklaşım geliştirme',
      'Duygusal bağ kurma becerileri',
      'Uzun vadeli vizyon oluşturma'
    ],
    famousLeaders: ['Bill Gates (erken dönem)', 'Vince Lombardi', 'Howard Schultz'],
    quote: '"Ölçemediğiniz şeyi yönetemezsiniz." - Peter Drucker',
  },
  {
    id: 'servant',
    name: 'Hizmetkar Lider',
    nameEn: 'Servant Leader',
    color: '#10B981',
    icon: Heart,
    description: 'Ekibine hizmet eden, destekleyen ve güçlendiren lider',
    strengths: [
      'Güçlü empati ve dinleme becerileri',
      'Ekip üyelerinin gelişimini önceleme',
      'Güven ortamı oluşturma',
      'Topluluk ruhu ve aidiyet yaratma'
    ],
    developmentAreas: [
      'Zor kararları zamanında alma',
      'Kendi ihtiyaçlarını dengeleme',
      'Net sınırlar koyma',
      'Stratejik düşünme becerilerini güçlendirme'
    ],
    famousLeaders: ['Mahatma Gandhi', 'Mother Teresa', 'Herb Kelleher'],
    quote: '"En iyi liderler, önce hizmet edenlerdir." - Robert K. Greenleaf',
  },
  {
    id: 'visionary',
    name: 'Vizyoner Lider',
    nameEn: 'Visionary Leader',
    color: '#F59E0B',
    icon: Crown,
    description: 'Geleceği gören, yön belirleyen ve değişimi yöneten lider',
    strengths: [
      'Uzun vadeli stratejik düşünme',
      'İlham verici vizyon oluşturma',
      'Değişimi öngörme ve yönetme',
      'İnovasyon ve risk alma'
    ],
    developmentAreas: [
      'Günlük operasyonlara dikkat',
      'Detay odaklı çalışma',
      'Ekibin mevcut ihtiyaçlarını görme',
      'Adım adım uygulama planları yapma'
    ],
    famousLeaders: ['Elon Musk', 'Walt Disney', 'Jeff Bezos'],
    quote: '"Geleceği tahmin etmenin en iyi yolu onu yaratmaktır." - Peter Drucker',
  },
];

function LeadershipResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');

  const [result, setResult] = useState<{
    scores: Record<string, number>;
    dominantStyle: string;
    completedAt: string;
  } | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastLeadershipResult');
    if (stored) {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      setLoading(false);

      // AI analizi oluştur
      generateAnalysis(parsed);
    } else {
      setLoading(false);
    }
  }, [testId]);

  const generateAnalysis = async (data: { scores: Record<string, number>; dominantStyle: string }) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/tests/leadership-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: data.scores,
          dominantStyle: data.dominantStyle,
        }),
      });

      if (response.ok) {
        const { analysis: aiAnalysis } = await response.json();
        setAnalysis(aiAnalysis);
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!result || !analysis) return;
    setSendingEmail(true);
    try {
      const dominantStyle = LEADERSHIP_STYLES.find(s => s.id === result.dominantStyle);
      const response = await fetch('/api/tests/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'leadership',
          scores: result.scores,
          dimensions: LEADERSHIP_STYLES.map(style => ({
            id: style.id,
            name: style.name,
            score: result.scores[style.id] || 0,
            color: style.color,
          })),
          overallLabel: dominantStyle?.name || 'Liderlik Tarzı',
          analysis: analysis,
          strengths: dominantStyle?.strengths,
          developmentAreas: dominantStyle?.developmentAreas,
        }),
      });
      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (error) {
      console.error('Email gonderme hatasi:', error);
    }
    setSendingEmail(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Test sonucu bulunamadı.</p>
        <Link href="/tests/leadership">
          <Button>Teste Dön</Button>
        </Link>
      </div>
    );
  }

  const dominantStyleData = LEADERSHIP_STYLES.find(s => s.id === result.dominantStyle);
  const sortedStyles = [...LEADERSHIP_STYLES].sort(
    (a, b) => (result.scores[b.id] || 0) - (result.scores[a.id] || 0)
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/tests')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Testlere Dön
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir (Yakında)
          </Button>
        </div>

        {/* Dominant Style Hero */}
        {dominantStyleData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border overflow-hidden mb-8"
            style={{ background: `linear-gradient(135deg, ${dominantStyleData.color}15, ${dominantStyleData.color}05)` }}
          >
            <div className="p-8 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${dominantStyleData.color}20` }}
              >
                {(() => {
                  const Icon = dominantStyleData.icon;
                  return <Icon className="h-10 w-10" style={{ color: dominantStyleData.color }} />;
                })()}
              </div>
              <p className="text-sm text-muted-foreground mb-2">Dominant Liderlik Tarzınız</p>
              <h1 className="text-3xl font-bold mb-2" style={{ color: dominantStyleData.color }}>
                {dominantStyleData.name}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {dominantStyleData.description}
              </p>
              <p className="mt-4 text-sm italic text-muted-foreground">
                {dominantStyleData.quote}
              </p>
            </div>
          </motion.div>
        )}

        {/* Skor Tablosu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Liderlik Profili
          </h2>
          <div className="space-y-4">
            {sortedStyles.map((style, idx) => {
              const score = result.scores[style.id] || 0;
              const Icon = style.icon;
              const isTop = idx === 0;

              return (
                <div key={style.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${style.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: style.color }} />
                      </div>
                      <span className={`font-medium ${isTop ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {style.name}
                      </span>
                      {isTop && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Dominant
                        </span>
                      )}
                    </div>
                    <span className="font-bold" style={{ color: style.color }}>
                      {score}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: style.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Güçlü Yönler ve Gelişim Alanları */}
        {dominantStyleData && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                Güçlü Yönleriniz
              </h3>
              <ul className="space-y-3">
                {dominantStyleData.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-1">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Gelişim Alanlarınız
              </h3>
              <ul className="space-y-3">
                {dominantStyleData.developmentAreas.map((area, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-1">→</span>
                    {area}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        {/* Ünlü Liderler */}
        {dominantStyleData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border p-6 mb-8"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Bu Tarzın Ünlü Liderleri
            </h3>
            <div className="flex flex-wrap gap-3">
              {dominantStyleData.famousLeaders.map((leader, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${dominantStyleData.color}15`, color: dominantStyleData.color }}
                >
                  {leader}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Analizi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-6 mb-8"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Kişiselleştirilmiş AI Analizi
          </h3>
          {generating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analiz oluşturuluyor...
            </div>
          ) : analysis ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{analysis}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Analiz yüklenirken bir hata oluştu.</p>
          )}
        </motion.div>

        {/* Aksiyonlar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSendEmail}
            disabled={sendingEmail || emailSent || !analysis}
          >
            {sendingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : emailSent ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {emailSent ? 'Gonderildi!' : 'Email Gonder'}
          </Button>
          <Link href="/tests" className="flex-1">
            <Button variant="outline" className="w-full">
              Baska Test Coz
            </Button>
          </Link>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">
            Liderlik tarzınızı geliştirmek için bir koçla çalışın
          </p>
          <Link href="/mentors">
            <Button className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500">
              Koç/Mentor ile Görüş
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

export default function LeadershipResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LeadershipResultContent />
    </Suspense>
  );
}
