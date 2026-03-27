'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, ClipboardList, Clock, ChevronRight,
  Sparkles, CheckCircle2, Star, Heart, Crown, Timer, Compass, User, Rocket
} from 'lucide-react';

// GRUP 1: Kendini Tanıma - Farkındalık yaratır (entry point)
const SELF_DISCOVERY_TESTS = [
  {
    id: 'personality',
    title: 'Big Five Kişilik Envanteri',
    description: 'Beş Faktör Kişilik Modeli ile kendinizi tanıyın. Dışadönüklük, Uyumluluk, Sorumluluk, Duygusal Denge ve Açıklık.',
    icon: Brain,
    duration: '15-20 dk',
    questions: 50,
    color: 'from-purple-500 to-indigo-600',
    academic: 'Ref: Costa & McCrae',
  },
  {
    id: 'emotional-intelligence',
    title: 'Duygusal Zeka Envanteri (EQ-i)',
    description: 'Öz farkındalık, öz yönetim, sosyal farkındalık, ilişki yönetimi ve stres yönetimi alanlarınızı ölçün.',
    icon: Heart,
    duration: '10-15 dk',
    questions: 40,
    color: 'from-pink-500 to-rose-600',
    academic: 'Ref: Bar-On',
  },
  {
    id: 'life-score',
    title: 'Thorius Hayat Skoru',
    description: 'Hayatınızın 8 temel alanını ölçün: Mutluluk, Anlam, Başarı, İlişkiler, Sağlık, Finans, Gelişim ve Denge.',
    icon: Star,
    duration: '10-12 dk',
    questions: 48,
    color: 'from-amber-500 via-orange-500 to-rose-500',
    academic: 'Ref: Seligman, Ryff, Diener',
  },
];

// GRUP 2: Hayatını Yönetme - Aksiyon + dönüşüm (para burada)
const LIFE_MANAGEMENT_TESTS = [
  {
    id: 'leadership',
    title: 'Liderlik Tarzı Envanteri',
    description: 'Liderlik yaklaşımınızı keşfedin: Dönüşümcü, İşlemci, Hizmetkar veya Vizyoner.',
    icon: Crown,
    duration: '10-15 dk',
    questions: 48,
    color: 'from-violet-500 via-purple-500 to-indigo-500',
    academic: 'Ref: Bass & Avolio',
  },
  {
    id: 'procrastination',
    title: 'Erteleme Profili Testi',
    description: 'Erteleme alışkanlıklarınızı anlayın ve kişiselleştirilmiş aksiyon planı alın.',
    icon: Timer,
    duration: '8-10 dk',
    questions: 28,
    color: 'from-red-500 via-orange-500 to-amber-500',
    academic: 'Ref: Piers Steel',
    badge: 'Popüler',
  },
  {
    id: 'life-purpose',
    title: 'Yaşam Amacı & Yön Testi',
    description: 'Hayatınıza anlam ve yön verin. Anlam duygusu, içsel motivasyon ve katkı alanlarınızı keşfedin.',
    icon: Compass,
    duration: '10-12 dk',
    questions: 32,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
    academic: 'Ref: Viktor Frankl',
    badge: 'Yeni',
  },
];

function TestCard({ test }: { test: typeof SELF_DISCOVERY_TESTS[0] & { badge?: string } }) {
  return (
    <Link href={`/tests/${test.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        {test.badge && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {test.badge}
          </span>
        )}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center shrink-0`}>
            <test.icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold mb-1 group-hover:text-primary transition-colors pr-16">
              {test.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {test.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {test.duration}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <ClipboardList className="h-3 w-3" />
                {test.questions} soru
              </span>
              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                {test.academic}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

export default function TestsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Akademik Tabanlı Testler</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Kişilik & Gelişim Envanterleri
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bilimsel olarak geçerliliği kanıtlanmış testlerle kendinizi tanıyın ve hayatınızı yönetin.
            </p>
          </motion.div>
        </div>

        {/* Bilgi Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Her test 1 seans hakkı kullanır</h3>
              <p className="text-sm text-muted-foreground">
                Test tamamlandığında seans hakkınızdan 1 adet düşülür. Karşılığında detaylı AI raporu ve kişiselleştirilmiş öneriler alırsınız.
              </p>
            </div>
          </div>
        </motion.div>

        {/* GRUP 1: Kendini Tanıma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Kendini Tanıma</h2>
              <p className="text-sm text-muted-foreground">&ldquo;Ben kimim, neredeyim?&rdquo;</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SELF_DISCOVERY_TESTS.map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <TestCard test={test} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* GRUP 2: Hayatını Yönetme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hayatını Yönetme</h2>
              <p className="text-sm text-muted-foreground">&ldquo;Ne yapmalıyım, nasıl ilerlemeliyim?&rdquo;</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LIFE_MANAGEMENT_TESTS.map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <TestCard test={test} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
