import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikasi',
  description: 'Thorius gizlilik politikasi ve kisisel verilerin korunmasi hakkinda bilgilendirme.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gizlilik Politikasi</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Son guncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Giris</h2>
            <p className="text-gray-700 mb-4">
              Thorius olarak, kullanicilarimizin gizliligine onem veriyoruz. Bu gizlilik politikasi,
              kisisel verilerinizin nasil toplandigi, kullanildigi ve korunduGu hakkinda bilgi vermektedir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Toplanan Veriler</h2>
            <p className="text-gray-700 mb-4">Platformumuz uzerinden asagidaki verileri toplayabiliriz:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Ad, soyad ve e-posta adresi</li>
              <li>Kocluk seanslari sirasinda paylasilan bilgiler</li>
              <li>Test sonuclari ve degerlendirmeler</li>
              <li>Kullanim istatistikleri ve tercihler</li>
              <li>Odeme bilgileri (ucuncu parti odeme saglayicilari tarafindan islenir)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Verilerin Kullanimi</h2>
            <p className="text-gray-700 mb-4">Toplanan veriler asagidaki amaclarla kullanilir:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Kisisellestirilmis kocluk hizmeti sunmak</li>
              <li>Hesap yonetimi ve iletisim</li>
              <li>Hizmet kalitesini iyilestirmek</li>
              <li>Yasal yukumlulukleri yerine getirmek</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Veri Guvenligi</h2>
            <p className="text-gray-700 mb-4">
              Verilerinizi korumak icin endustri standartlarinda guvenlik onlemleri uyguluyoruz.
              Tum veriler sifrelenmis baglanti uzerinden iletilir ve guvenli sunucularda saklanir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Ucuncu Taraflar</h2>
            <p className="text-gray-700 mb-4">
              Verileriniz, hizmetlerimizi sunmak icin kullandigimiz guvenilir ucuncu taraf
              hizmet saglayicilariyla paylasilabilir (odeme islemcileri, hosting hizmetleri vb.).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cerezler</h2>
            <p className="text-gray-700 mb-4">
              Web sitemiz, kullanici deneyimini iyilestirmek icin cerezler kullanmaktadir.
              Cerez tercihlerinizi tarayici ayarlarinizdan yonetebilirsiniz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Haklariniz</h2>
            <p className="text-gray-700 mb-4">KVKK kapsaminda asagidaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Kisisel verilerinizin islenmesini ogrenme</li>
              <li>Verilerinize erisim talep etme</li>
              <li>Verilerinizin duzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri islemesine itiraz etme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Iletisim</h2>
            <p className="text-gray-700">
              Gizlilik ile ilgili sorulariniz icin bizimle iletisime gecebilirsiniz:<br />
              <strong>E-posta:</strong> info@thorius.com.tr<br />
              <strong>Adres:</strong> Sandalci Mecit Cd. No 9/1 Ortakoy / Besiktas - Istanbul
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
