import { BookOpen, Clock, User, ChevronRight, Quote, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Koçluk & Mentorluk Hakkında — Thorius',
  description: 'Koçluk ve mentorluk nedir, aralarındaki fark nedir? Dr. Elif Demir Uğur\'un kaleme aldığı kapsamlı rehber.',
};

const TOC = [
  { id: 'kocluk-nedir', label: 'Koçluk Nedir?' },
  { id: 'kocluk-faydalari', label: 'Profesyonel Koçluğun Faydaları' },
  { id: 'kocluk-ozellikleri', label: 'Koçluğun Temel Özellikleri' },
  { id: 'mentorluk-nedir', label: 'Mentorluk Nedir?' },
  { id: 'mentorluk-ne-degildir', label: 'Mentorluk Ne Değildir?' },
  { id: 'iliski', label: 'Koçluk & Mentorluk İlişkisi' },
];

export default function KoclukMentorPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border" style={{
        background: 'linear-gradient(135deg, #1a0533 0%, #4c0f8f 30%, #7c3aed 60%, #0ea5e9 100%)',
      }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-40 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/50">
            <Link href="/" className="hover:text-white/80 transition-colors">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">Koçluk & Mentorluk Hakkında</span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-5 backdrop-blur-sm">
            <BookOpen className="h-3 w-3" />
            Rehber Makale
          </div>

          <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Koçluk ve Mentorluk:<br />
            <span className="text-sky-200">Kapsamlı Bir Rehber</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/70">
            Koçluk ve mentorluk nedir, birbirinden nasıl ayrılır ve kişisel ile mesleki gelişiminize
            nasıl katkı sağlar? Uluslararası Koçluk Standartlarında hazırlanmış bu rehber, tüm sorularınızı yanıtlıyor.
          </p>

          {/* Yazar kartı */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/15 text-lg font-bold text-white backdrop-blur-sm">
              E
            </div>
            <div>
              <p className="font-semibold text-white">Dr. Elif DEMİR UĞUR</p>
              <div className="flex items-center gap-3 text-xs text-white/55">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> Uluslararası Sertifikalı Koç</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 10 dk okuma</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-12">

          {/* Ana makale */}
          <article className="flex-1 min-w-0">

            {/* ── Koçluk Nedir ──────────────────────────────────────── */}
            <section id="kocluk-nedir" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-primary">01</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Koçluk Nedir?</h2>

              <p className="mb-4 leading-relaxed text-muted-foreground">
                Koçluk uygulamaları; kişisel gelişimine ivme kazandırmak isteyen, yeni bir role
                geçen ya da mevcut sorumluluklarını daha etkin şekilde yerine getirmek isteyen
                bireyler için tasarlanmış, planlı ve profesyonel bir gelişim ilişkisini kapsar.
                Bu ilişki, bireyin performansına değil, <strong className="text-foreground">potansiyeline</strong> odaklanır;
                bulunduğu nokta ile ulaşmak istediği nokta arasındaki mesafeyi geleceğe odaklanarak kapatmaya çalışır.
              </p>

              <div className="my-6 rounded-2xl border border-primary/15 bg-primary/4 p-6">
                <Quote className="mb-3 h-6 w-6 text-primary/40" />
                <blockquote className="text-base italic leading-relaxed text-foreground/80">
                  "Koçluk, kişisel ve profesyonel potansiyellerini en üst düzeye çıkarmak için
                  bireylere ilham veren, düşündürücü ve yaratıcı bir süreçte onlarla ortaklık yapmaktır."
                </blockquote>
                <p className="mt-3 text-xs font-medium text-primary">— Uluslararası Koçluk Federasyonu</p>
              </div>

              <p className="mb-4 leading-relaxed text-muted-foreground">
                Koçluk görüşmeleri, Uluslararası Koçluk Federasyonu'nun MCC seviyesinde ve
                belirlediği etik kurallara bağlı kalınarak yürütülür. Bu standartlar, koçluk sürecinin
                güvenli, gizli ve profesyonel bir zeminde ilerlemesini güvence altına alır.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Koçluk süreci genellikle daha önce kullanılmayan hayal gücü, üretkenlik ve liderlik
                kaynaklarının kilidini açar. Bireyler farkındalık kazanarak içsel ve dışsal kaynaklarını
                harekete geçirir; hızla hedeflerine — hatta daha fazlasına — ulaşırlar. Bu süreçte
                kendi gelişimlerinin ve öz yönetimlerinin sorumluluğunu üstlenir,
                öğrendiklerini yaşamlarının her alanına taşıyabilirler.
              </p>
            </section>

            {/* ── Koçluğun Faydaları ────────────────────────────────── */}
            <section id="kocluk-faydalari" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-secondary/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-secondary">02</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Profesyonel Koçluğun Faydaları</h2>

              <p className="mb-6 leading-relaxed text-muted-foreground">
                Profesyonel koçluk, bireyin hayatında birçok anlamlı değişim yaratır. Basitçe ifade
                etmek gerekirse koçluk; performansı geliştirmeyi amaçlayan ve geçmiş ya da gelecekten
                ziyade <strong className="text-foreground">şu ana odaklanan</strong> bir süreçtir.
                Bireyin her zaman kendi sorunlarına çözüm bulacağına inanır — ancak yanıtı bulmak için
                zaman zaman bir ortağa ihtiyaç duyabileceğini de kabul eder.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Yeni perspektifler', desc: 'Hayatınızdaki zorluklara farklı ve taze açılardan bakmanızı sağlar.' },
                  { title: 'Karar verme becerisi', desc: 'Belirsizlik içinde net ve kararlı adımlar atmanıza yardım eder.' },
                  { title: 'İlişki etkinliği', desc: 'Kişiler arası ilişkilerde etkinliği artırır, güveni pekiştirir.' },
                  { title: 'Hedeflere ulaşma', desc: 'Verimlilik, iş ve yaşam doyumunda ölçülebilir ve belirgin farklılık yaratır.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl border border-border bg-muted/30 p-4">
                    <h4 className="mb-1.5 font-semibold text-foreground">{title}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Koçluğun Temel Özellikleri ───────────────────────── */}
            <section id="kocluk-ozellikleri" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-accent">03</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Koçluğun Temel Özellikleri</h2>

              <div className="space-y-3">
                {[
                  'Kişiye özgüdür — tek tip bir yaklaşım yoktur.',
                  'Bireyin konusuna değil, bizzat kendisine odaklanır.',
                  'Yaparak ve yaşayarak öğrenmeye dayalıdır.',
                  'Başlangıcı, ortası ve ölçülebilir sonuçları vardır.',
                  'Geri bildirim ve nesnelliğe dayanır.',
                  'Koç ile birey arasında gelişen sinerji yeni bir enerji kazandırır.',
                  'Birey kendi hedefini kendisi belirler.',
                  'Koçlar bireyin performansına değil, potansiyeline odaklanır.',
                  'Süreç; öz yönetimin ve kişisel gelişimin sorumluluğunu bireye kazandırır.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Mentorluk Nedir ───────────────────────────────────── */}
            <section id="mentorluk-nedir" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-primary">04</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Mentorluk Nedir?</h2>

              <p className="mb-4 leading-relaxed text-muted-foreground">
                Mentorluk; deneyimli ve konusunda uzman bir kişinin (mentorun) bilgi ve deneyimini,
                diğer bir kişiye (mentee/danışana) aktardığı ve ona örnek olduğu bir öğrenme ve gelişim ilişkisidir.
                Özünde, bir kişinin bilgeliğini başka bir kişinin kendi bilgeliğini geliştirmesi için
                hizmetine sunduğu bir modeldir. Aynı zamanda bir <strong className="text-foreground">liderlik modelidir</strong>.
              </p>

              <div className="my-6 rounded-2xl border border-secondary/20 bg-secondary/6 p-6">
                <p className="text-base font-semibold text-foreground mb-2">Mentorluk tek taraflı değildir.</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Mentor ve mentee arasındaki ilişki, iki yönlü ve kişiseldir. Her iki tarafın da
                  yeni şeyler öğrendiği, yeni bakış açıları geliştirdiği bu ilişki; karşılıklı
                  öğrenme ve güç birliği şeklinde ilerler.
                </p>
              </div>

              <p className="leading-relaxed text-muted-foreground">
                Mentorluk, gönüllülük esasına dayalı, ticari bir akit olmayan; gelişime ve değişime
                odaklanmış bir bağdır. Bu ilişkide mentor, danışanın omzuna yaslanacağı bir destek
                noktası değil; omuz omuza birlikte başarmak ve sinerji yaratmak için var olan bir
                yol arkadaşıdır.
              </p>
            </section>

            {/* ── Mentorluk Ne Değildir ─────────────────────────────── */}
            <section id="mentorluk-ne-degildir" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-secondary/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-secondary">05</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Mentorluk Ne Değildir?</h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Mentorluk kavramı zaman zaman yanlış anlaşılmaktadır. Aşağıdaki ayrımlar bu kavramın
                sınırlarını netleştirir:
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Danışmanlık değildir',
                    desc: 'Mentor; yaşanmış başarı ve başarısızlıklarını deneyimleriyle paylaşır. Yol haritası çizmez — başarıya giden yolu aydınlatır ve yolculukta yan koltuktadır.',
                  },
                  {
                    title: 'Terapi değildir',
                    desc: 'Mentor; geçmişteki travmaları iyileştirmeye değil, geleceği inşa etmeye ve değişime odaklanır.',
                  },
                  {
                    title: 'Eğitim değildir',
                    desc: 'Mentor, mesleki ya da kişisel beceri eğitimi vermez. Yaparak ve yaşayarak öğrenmiş, deneyimli bir gönüllü rehberdir. Karşısında "eğitilmeye değil, öğrenmeye susamış" bireyler ister.',
                  },
                  {
                    title: 'Şikâyet kutusu değildir',
                    desc: 'Mentor; omuz omuza birlikte başarmak ve sinerji yaratmak için vardır. Bir şikâyet ya da dert dinleme mekanizması değildir.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4 rounded-xl border border-border p-4">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" />
                    <div>
                      <h4 className="mb-1 font-semibold text-foreground">{title}</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/4 p-5">
                <p className="text-sm font-semibold text-foreground mb-1">Mentor doğulmaz.</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Mentorluk; bilgi, uzmanlık ve deneyim sahibi bireylerin eğitim aldığı, kesintisiz
                  öğrenmeye devam ettiği bir gelişim sürecidir. İçinde yaşanılan topluma değer katmanın
                  verdiği gurur ile mentor olunur.
                </p>
              </div>
            </section>

            {/* ── Koçluk & Mentorluk İlişkisi ──────────────────────── */}
            <section id="iliski" className="mb-14 scroll-mt-24">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-accent">06</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-5 text-2xl font-bold text-foreground">Koçluk & Mentorluk İlişkisi</h2>

              <p className="mb-4 leading-relaxed text-muted-foreground">
                Koçluk ve mentorluk birbirinden farklı disiplinler olmakla birlikte, birini tamamlayan
                unsurlar barındırır. Mentorluk, koçluk değildir — ancak etkili bir mentor için temel
                koçluk becerilerine sahip olmak, başarı ve gelişim için vazgeçilmezdir.
                Bu nedenle uluslararası standartlarda mentorluk eğitiminin içinde "temel koçluk"
                önemli bir yer tutar.
              </p>

              <p className="leading-relaxed text-muted-foreground">
                Bireyler; hem koçluk hem de mentorluk süreçlerinde edindikleri yeni bilgileri
                kalıcı olarak hayatlarının tüm alanlarına yayma fırsatı elde ederler. Bu iki
                sürecin ortak noktası, bireyin kendi potansiyelini keşfetmesi ve sürdürülebilir
                bir gelişim yolu inşa etmesidir.
              </p>

              {/* Karşılaştırma tablosu */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-border">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="bg-primary/6 p-5">
                    <h4 className="mb-4 font-bold text-primary">Koçluk</h4>
                    <ul className="space-y-2">
                      {['Bireyin potansiyeline odaklanır', 'Soru sorar, çözüm vermez', 'Şu ana ve geleceğe odaklıdır', 'Uluslararası Koçluk etik standartlarına bağlıdır', 'Hedefi birey belirler'].map(i => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-secondary/6 p-5">
                    <h4 className="mb-4 font-bold text-secondary">Mentorluk</h4>
                    <ul className="space-y-2">
                      {['Deneyim ve bilgi aktarır', 'Tavsiye ve öneri sunar', 'Geleceğe yönelik rehberlik eder', 'Gönüllülük esasına dayanır', 'İki yönlü bir öğrenme ilişkisidir'].map(i => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />{i}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Yazar kutusu */}
            <div className="rounded-2xl border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #4c0f8f, #0ea5e9)' }}>
                  E
                </div>
                <div>
                  <p className="font-bold text-foreground">Dr. Elif DEMİR UĞUR</p>
                  <p className="mb-2 text-sm text-primary">Uluslararası Sertifikalı Koç & Eğitimci</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    20 yılı aşkın deneyimiyle kurumsal koçluk, mentorluk program tasarımı ve liderlik
                    geliştirme alanlarında çalışmalarını sürdürmektedir. Uluslararası Koçluk Federasyonu aktif üyesi
                    ve AI Koçluk - Mentorluk uygulaması tasarımcısıdır.
                  </p>
                </div>
              </div>
            </div>

          </article>

          {/* İçindekiler — sabit kenar çubuğu */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-muted/30 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">İçindekiler</p>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hemen Dene</p>
                <Link href="/mentors">
                  <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 text-center text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                    AI Koçunla Tanış →
                  </div>
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
