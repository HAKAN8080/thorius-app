'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, ClipboardList, Clock, ChevronRight,
  Sparkles, Lock, CheckCircle2, Star, Heart, Crown
} from 'lucide-react';

const TESTS = [
  {
    id: 'life-score',
    title: 'Thorius Hayat Skoru',
    description: 'Hayatınızın 8 temel alanını ölçün: Mutluluk, Anlam, Başarı, İlişkiler, Sağlık, Finans, Gelişim ve Denge. PERMA + Yaşam Çarkı hibrit modeli.',
    icon: Star,
    duration: '10-12 dk',
    questions: 48,
    color: 'from-amber-500 via-orange-500 to-rose-500',
    available: true,
    academic: 'Ref: Seligman, Ryff, Diener',
    featured: true,
  },
  {
    id: 'personality',
    title: 'Big Five Kişilik Envanteri',
    description: 'Beş Faktör Kişilik Modeli ile kendinizi tanıyın. Dışadönüklük, Uyumluluk, Sorumluluk, Duygusal Denge ve Açıklık kategorilerinde detaylı analiz.',
    icon: Brain,
    duration: '15-20 dk',
    questions: 50,
    color: 'from-purple-500 to-indigo-600',
    available: true,
    academic: 'Ref: Costa & McCrae',
  },
  {
    id: 'emotional-intelligence',
    title: 'Duygusal Zeka Envanteri (EQ-i)',
    description: 'İş dünyasında en popüler EQ testi. Öz farkındalık, öz yönetim, sosyal farkındalık, ilişki yönetimi ve stres yönetimi alanlarında kendinizi ölçün.',
    icon: Heart,
    duration: '10-15 dk',
    questions: 40,
    color: 'from-pink-500 to-rose-600',
    available: true,
    academic: 'Ref: Bar-On',
  },
  {
    id: 'leadership',
    title: 'Liderlik Tarzı Envanteri',
    description: 'Liderlik yaklaşımınızı keşfedin: Dönüşümcü, İşlemci, Hizmetkar veya Vizyoner. Akademik temelli kapsamlı analiz.',
    icon: Crown,
    duration: '10-15 dk',
    questions: 48,
    color: 'from-violet-500 via-purple-500 to-indigo-500',
    available: true,
    academic: 'Ref: Bass & Avolio',
  },
];

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
              Kişilik Envanterleri
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bilimsel olarak geçerliliği kanıtlanmış kişilik testleri ile kendinizi daha iyi tanıyın.
              AI destekli detaylı raporlar ve kişisel gelişim önerileri.
            </p>
          </motion.div>
        </div>

        {/* Bilgi Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Her test 1 seans hakkı kullanır</h3>
              <p className="text-sm text-muted-foreground">
                Test tamamlandığında seans hakkınızdan 1 adet düşülür. Karşılığında detaylı AI raporu,
                grafikler ve PDF çıktısı alırsınız.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Test Listesi */}
        <div className="grid gap-4">
          {TESTS.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              {test.available ? (
                <Link href={`/tests/${test.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center shrink-0`}>
                        <test.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {test.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {test.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {test.duration}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <ClipboardList className="h-3.5 w-3.5" />
                                {test.questions} soru
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {test.academic}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 opacity-60">
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Yakında
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center shrink-0 opacity-50`}>
                      <test.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">{test.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {test.duration}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {test.questions} soru
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {test.academic}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
