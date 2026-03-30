import { Target, Users, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="mb-4 inline-block rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Hakkımızda
          </span>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Thorius AI Koçluk Platformu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Yapay zeka destekli koçluk ve mentorluk hizmetleriyle kişisel ve profesyonel gelişiminizi destekliyoruz.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {[
            {
              icon: Target,
              title: 'Misyonumuz',
              desc: 'Herkesin kaliteli koçluk ve mentorluk hizmetlerine erişebilmesini sağlamak. Yapay zeka teknolojisini kullanarak, 7/24 erişilebilir, kişiselleştirilmiş gelişim deneyimi sunuyoruz.',
            },
            {
              icon: Users,
              title: 'Vizyonumuz',
              desc: 'Türkiye\'nin lider AI koçluk platformu olarak, bireylerin potansiyellerini keşfetmelerine ve kariyer hedeflerine ulaşmalarına yardımcı olmak.',
            },
            {
              icon: Award,
              title: 'Standartlarımız',
              desc: 'Uluslararası Koçluk Federasyonu (ICF) etik standartlarına uygun olarak yapılandırılmış AI koç ve mentorlarımız, GROW metodolojisi ile çalışır.',
            },
            {
              icon: Heart,
              title: 'Değerlerimiz',
              desc: 'Gizlilik, güven, etik ve sürekli gelişim. Kullanıcılarımızın verilerini korur, her seansı gizli tutar ve sürekli kendimizi geliştiririz.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center bg-muted/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Neden Thorius?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thorius, geleneksel koçluk deneyimini yapay zeka ile birleştirerek,
            daha erişilebilir, uygun maliyetli ve etkili bir gelişim yolculuğu sunar.
            AI koç ve mentorlarımız, uluslararası standartlarda eğitilmiş ve
            her kullanıcının bireysel ihtiyaçlarına göre kişiselleştirilmiş rehberlik sağlar.
          </p>
        </div>
      </div>
    </div>
  );
}
