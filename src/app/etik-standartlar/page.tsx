import { Shield, CheckCircle2, Heart, Eye, Users, Brain, AlertTriangle } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Heart,
    title: 'Kullanıcı Odaklılık',
    description:
      'Her koçluk seansı kullanıcının ihtiyaç ve hedefleri doğrultusunda şekillenir. Kişisel bilgiler gizli tutulur, üçüncü şahıslarla paylaşılmaz.',
  },
  {
    icon: Brain,
    title: 'GROW Metodolojisi',
    description:
      'Uluslararası koçluk standartlarında kabul görmüş GROW (Goal, Reality, Options, Will) modeli temel alınarak seanslar yapılandırılır.',
  },
  {
    icon: Eye,
    title: 'Şeffaflık',
    description:
      'Platformdaki tüm koç ve mentorlar yapay zeka sistemleridir. Bu durum kullanıcılara açıkça belirtilir; herhangi bir yanıltma söz konusu değildir.',
  },
  {
    icon: Users,
    title: 'Kapsayıcılık',
    description:
      'Yaş, cinsiyet, etnik köken veya meslek ayrımı gözetmeksizin herkese eşit kalitede hizmet sunulur.',
  },
  {
    icon: Shield,
    title: 'Veri Güvenliği',
    description:
      'Seans içerikleri şifreli olarak saklanır. Kullanıcılar verilerini istedikleri zaman silme hakkına sahiptir.',
  },
  {
    icon: AlertTriangle,
    title: 'Yapay Zeka Sınırları',
    description:
      'AI koç ve mentorlar psikolojik tedavi, tıbbi tavsiye veya hukuki danışmanlık sağlamaz. Bu tür durumlarda kullanıcı ilgili uzmanına yönlendirilir.',
  },
];

const AI_COMMITMENTS = [
  'Yanıtlar gerçek Uluslararası Koçluk ilkeleri doğrultusunda tasarlanmıştır.',
  'Kullanıcı kendi kararlarını kendi verir; AI yönlendirme değil, keşif ortamı sağlar.',
  'Duygusal kriz durumlarında profesyonel destek alınması teşvik edilir.',
  'Koçluk seansları soru odaklıdır; tavsiye vermek yerine farkındalık yaratır.',
  'Seans özetleri ve ödevler kullanıcının onayıyla kaydedilir.',
];

export default function EthicsPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Etik Standartlarımız
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground leading-relaxed">
            Thorius, yapay zeka destekli koçluk hizmetini en yüksek etik standartlarda sunmayı taahhüt eder.
            Kullanıcılarımızın güveni ve refahı her şeyden önce gelir.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* AI Commitments */}
        <div className="mb-14 rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <div className="mb-5 flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Yapay Zeka Kullanım Taahhütlerimiz</h2>
          </div>
          <ul className="space-y-3">
            {AI_COMMITMENTS.map((commitment, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span className="text-sm leading-relaxed">{commitment}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-sm">Önemli Not</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thorius üzerindeki tüm koç ve mentorlar yapay zeka sistemidir. Gerçek bir insan koç veya
            mentorun yerini tutmaz. Ciddi psikolojik, tıbbi veya hukuki sorunlarınız için lütfen
            ilgili alanda lisanslı bir uzmanla iletişime geçiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
