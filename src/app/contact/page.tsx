import { Mail, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="mb-4 inline-block rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            İletişim
          </span>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Bize Ulaşın
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {[
            {
              icon: Mail,
              title: 'E-posta',
              desc: 'destek@thorius.com.tr',
              sub: 'Genel sorular için',
            },
            {
              icon: MessageSquare,
              title: 'Destek',
              desc: 'Uygulama içi chat',
              sub: 'Hızlı yardım için',
            },
            {
              icon: Clock,
              title: 'Yanıt Süresi',
              desc: '24 saat içinde',
              sub: 'İş günlerinde',
            },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <div key={title} className="text-center rounded-xl border border-border p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-primary font-medium">{desc}</p>
              <p className="text-sm text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-muted/30 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Mesaj Gönderin</h2>
          <form className="space-y-4 max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Adınız</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Adınız Soyadınız"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">E-posta</label>
              <input
                type="email"
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Konu</label>
              <select className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Genel Soru</option>
                <option>Teknik Destek</option>
                <option>Ödeme / Abonelik</option>
                <option>Öneri / Geri Bildirim</option>
                <option>İş Birliği</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mesajınız</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Mesajınızı buraya yazın..."
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
              Gönder
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
