import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Thorius - AI Koc & Mentor",
    template: "%s | Thorius"
  },
  description: "Claude AI destekli profesyonel kocluk ve mentorluk platformu. Kisisel gelisim, kariyer ve is hedeflerinize ulasin.",
  keywords: ["AI koc", "yapay zeka mentor", "kisisel gelisim", "kariyer koclugu", "yasam koclugu", "online kocluk", "Turkce koc"],
  authors: [{ name: "Thorius" }],
  creator: "Thorius",
  publisher: "Thorius",
  metadataBase: new URL('https://coaching.thorius.com.tr'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://coaching.thorius.com.tr',
    siteName: 'Thorius',
    title: 'Thorius - AI Koc & Mentor',
    description: 'Claude AI destekli profesyonel kocluk ve mentorluk platformu. 7/24 erisim, kisisellestirilmis rehberlik.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Thorius AI Kocluk Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thorius - AI Koc & Mentor',
    description: 'Claude AI destekli profesyonel kocluk ve mentorluk platformu.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'GOOGLE_SITE_VERIFICATION_CODE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <GoogleAnalytics />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
