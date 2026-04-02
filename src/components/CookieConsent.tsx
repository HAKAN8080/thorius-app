'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'thorius_cookie_consent'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
    // Reload to activate analytics
    window.location.reload()
  }

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 pr-8">
            <p className="text-sm text-gray-600">
              Web sitemizde deneyiminizi iyilestirmek icin cerezler kullaniyoruz.{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Gizlilik Politikasi
              </Link>{' '}
              ve{' '}
              <Link href="/kvkk" className="text-primary hover:underline">
                KVKK Aydinlatma Metni
              </Link>
              &apos;ni inceleyebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sadece Gerekli
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tumunu Kabul Et
            </button>
          </div>

          <button
            onClick={acceptNecessary}
            className="absolute top-2 right-2 sm:hidden p-1 text-gray-400 hover:text-gray-600"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper to check consent
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) return false
    const parsed = JSON.parse(consent)
    return parsed.analytics === true
  } catch {
    return false
  }
}
