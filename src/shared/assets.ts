export const BRAND_ASSETS = {
  mark: '/assets/branding/boilabin-mark.svg',
  markLight: '/assets/branding/boilabin-mark.svg',
  wordmark: '/assets/branding/boilabin-wordmark-black.svg',
  wordmarkLight: '/assets/branding/boilabin-wordmark-white.svg',
  wordmarkFull: '/assets/branding/boilabin-wordmark-black.svg',
  lockup: '/assets/branding/boilabin-wordmark-black.svg',
  icons: {
    faviconIco: '/favicon.ico',
    favicon16: '/assets/branding/favicons/favicon-16x16.png',
    favicon32: '/assets/branding/favicons/favicon-32x32.png',
    appleTouch: '/assets/branding/favicons/apple-touch-icon.png',
    app192: '/assets/branding/favicons/android-chrome-192x192.png',
    app512: '/assets/branding/favicons/android-chrome-512x512.png',
    manifest: '/site.webmanifest',
    appLight: '/assets/branding/icons/app-icon-light.svg',
    appDark: '/assets/branding/icons/app-icon-dark.svg',
  },
} as const

export const PAYMENT_ASSETS = {
  CASH_ON_DELIVERY: {
    src: '/assets/payments/cod.svg',
    alt: 'Cash on Delivery',
    width: 52,
    height: 28,
  },
  BKASH: {
    src: '/assets/payments/bkash.svg',
    alt: 'bKash',
    width: 124,
    height: 114,
  },
  NAGAD: {
    src: '/assets/payments/nagad.svg',
    alt: 'Nagad',
    width: 89,
    height: 116,
  },
  VISA: {
    src: '/assets/payments/visa.svg',
    alt: 'Visa',
    width: 1000,
    height: 325,
  },
  MASTERCARD: {
    src: '/assets/payments/mastercard.svg',
    alt: 'Mastercard',
    width: 1000,
    height: 618,
  },
} as const

export const APP_BADGE_ASSETS = {
  APP_STORE: {
    src: '/assets/app-badges/app-store-badge.webp',
    alt: 'Download on the App Store',
    width: 350,
    height: 105,
  },
  GOOGLE_PLAY: {
    src: '/assets/app-badges/google-play-badge.webp',
    alt: 'Get it on Google Play',
    width: 350,
    height: 105,
  },
} as const
