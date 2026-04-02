import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydinlatma Metni',
  description: 'Thorius KVKK kapsaminda kisisel verilerin korunmasi aydinlatma metni.',
}

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">KVKK Aydinlatma Metni</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            6698 Sayili Kisisel Verilerin Korunmasi Kanunu Kapsaminda Aydinlatma Metni
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
            <p className="text-gray-700 mb-4">
              6698 sayili Kisisel Verilerin Korunmasi Kanunu (&quot;KVKK&quot;) uyarinca, kisisel verileriniz
              veri sorumlusu sifatiyla Thorius tarafindan asagida aciklanan kapsamda islenebilecektir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Kisisel Verilerin Islenmesi ve Amaci</h2>
            <p className="text-gray-700 mb-4">Kisisel verileriniz asagidaki amaclarla islenmektedir:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Uyelik islemlerinin gerceklestirilmesi</li>
              <li>Kocluk ve mentorluk hizmetlerinin sunulmasi</li>
              <li>Kisisellestirilmis icerik ve onerilerin saglanmasi</li>
              <li>Musteri iliskilerinin yonetimi</li>
              <li>Yasal yukumluluklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin artirilmasi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Islenen Kisisel Veriler</h2>
            <p className="text-gray-700 mb-4">Asagidaki kisisel veri kategorileri islenmektedir:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
              <li><strong>Iletisim Bilgileri:</strong> E-posta adresi</li>
              <li><strong>Islem Guvenligi:</strong> Sifre (sifreli olarak)</li>
              <li><strong>Musteri Islem Bilgileri:</strong> Seans kayitlari, test sonuclari</li>
              <li><strong>Pazarlama Bilgileri:</strong> Tercihler, ilgi alanlari</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Kisisel Verilerin Aktarimi</h2>
            <p className="text-gray-700 mb-4">
              Kisisel verileriniz, KVKK&apos;nin 8. ve 9. maddelerinde belirtilen sartlar cercevesinde
              asagidaki taraflara aktarilabilir:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Yasal zorunluluklar kapsaminda yetkili kamu kurum ve kuruluslari</li>
              <li>Hizmet aldigimiz tedarikci firmalar (hosting, odeme altyapisi)</li>
              <li>Is ortaklari (gerekli durumlarda)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Kisisel Veri Toplamanin Yontemi ve Hukuki Sebebi</h2>
            <p className="text-gray-700 mb-4">
              Kisisel verileriniz, elektronik ortamda web sitesi ve mobil uygulama uzerinden
              toplanmaktadir. Verileriniz KVKK&apos;nin 5. maddesinde belirtilen;
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Acik rizaniz</li>
              <li>Sozlesmenin kurulmasi veya ifasi</li>
              <li>Hukuki yukumluluk</li>
              <li>Mesru menfaat</li>
            </ul>
            <p className="text-gray-700 mt-4">hukuki sebeplerine dayanilarak islenmektedir.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Ilgili Kisi Haklari</h2>
            <p className="text-gray-700 mb-4">KVKK&apos;nin 11. maddesi uyarinca asagidaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
              <li>Kisisel verileriniz islenmisse buna iliskin bilgi talep etme</li>
              <li>Kisisel verilerinizin islenme amacini ve bunlarin amacina uygun kullanilip kullanilmadigini ogrenme</li>
              <li>Yurt icinde veya yurt disinda kisisel verilerinizin aktarildigi ucuncu kisileri bilme</li>
              <li>Kisisel verilerinizin eksik veya yanlis islenmis olmasi halinde bunlarin duzeltilmesini isteme</li>
              <li>KVKK&apos;nin 7. maddesinde ongorulen sartlar cercevesinde kisisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>Islemin ucuncu kisilere bildirilmesini isteme</li>
              <li>Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme</li>
              <li>Kisisel verilerinizin kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin giderilmesini talep etme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Basvuru Yontemi</h2>
            <p className="text-gray-700 mb-4">
              Yukarida belirtilen haklarinizi kullanmak icin asagidaki kanallar uzerinden
              bizimle iletisime gecebilirsiniz:
            </p>
            <p className="text-gray-700">
              <strong>E-posta:</strong> kvkk@thorius.com.tr<br />
              <strong>Adres:</strong> Sandalci Mecit Cd. No 9/1 Ortakoy / Besiktas - Istanbul
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Veri Guvenligi</h2>
            <p className="text-gray-700 mb-4">
              Kisisel verilerinizin guvenligini saglamak icin gerekli teknik ve idari tedbirleri
              almaktayiz. Verileriniz sifreli baglanti (SSL) uzerinden iletilmekte ve guvenli
              sunucularda muhafaza edilmektedir.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
