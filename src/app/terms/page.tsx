import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanim Kosullari',
  description: 'Thorius platformu kullanim kosullari ve hizmet sartlari.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kullanim Kosullari</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Son guncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Hizmet Tanimi</h2>
            <p className="text-gray-700 mb-4">
              Thorius, yapay zeka destekli kocluk ve mentorluk hizmeti sunan bir platformdur.
              Platformumuz, kullanicilara kisisel gelisim, kariyer ve yasam hedeflerinde
              rehberlik saglamak amaciyla tasarlanmistir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Hesap Olusturma</h2>
            <p className="text-gray-700 mb-4">
              Platformu kullanmak icin gecerli bir e-posta adresi ile kayit olmaniz gerekmektedir.
              Hesap bilgilerinizin guvenliginden siz sorumlusunuz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Kullanim Kurallari</h2>
            <p className="text-gray-700 mb-4">Platformu kullanirken asagidaki kurallara uymaniz gerekmektedir:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Yanlis veya yaniltici bilgi paylasmayin</li>
              <li>Diger kullanicilarin haklarini ihlal etmeyin</li>
              <li>Platformu yasadisi amaclarla kullanmayin</li>
              <li>Sisteme zarar verecek faaliyetlerde bulunmayin</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. AI Kocluk Hizmeti</h2>
            <p className="text-gray-700 mb-4">
              Platformumuzda sunulan AI kocluk hizmeti, profesyonel psikolojik danismanlik veya
              terapi hizmetinin yerini almaz. Ciddi psikolojik sorunlar icin profesyonel
              yardim almanizi oneririz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Odeme ve Abonelik</h2>
            <p className="text-gray-700 mb-4">
              Ucretli paketler icin odeme yaptiginizda, sectiginiz plana uygun kredi veya
              seans hakki tanimlanir. Odemeler iade edilmez, ancak istisnai durumlarda
              destek ekibimize basvurabilirsiniz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Fikri Mulkiyet</h2>
            <p className="text-gray-700 mb-4">
              Platform uzerindeki tum icerikler, tasarimlar ve yazilimlar Thorius&apos;un
              fikri mulkiyetidir. Izinsiz kopyalama ve dagitim yasaktir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Sorumluluk Sinirlamasi</h2>
            <p className="text-gray-700 mb-4">
              Thorius, platform kullanimindan kaynaklanabilecek dolayli zararlardan
              sorumlu tutulamaz. Hizmet &quot;oldugu gibi&quot; sunulmaktadir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Degisiklikler</h2>
            <p className="text-gray-700 mb-4">
              Bu kullanim kosullarini onceden haber vermeksizin degistirme hakkimiz saklidir.
              Degisiklikler yayinlandigi anda yururluge girer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Iletisim</h2>
            <p className="text-gray-700">
              Sorulariniz icin bizimle iletisime gecebilirsiniz:<br />
              E-posta: info@thorius.com.tr
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
