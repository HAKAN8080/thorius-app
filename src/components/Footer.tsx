import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <Image
              src="/thorius-logo.png"
              alt="Thorius"
              width={24}
              height={24}
              className="h-6 w-auto"
            />
            <span className="text-lg font-semibold text-primary">Thorius</span>
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Tüm hakları saklıdır.
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
              İletişim
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/kvkk" className="text-gray-600 hover:text-primary transition-colors">
              KVKK
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
