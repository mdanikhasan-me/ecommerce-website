export const BRAND_ASSETS = {
  mark: '/assets/brand/boilabin-mark.svg?v=2',
  markLight: '/assets/brand/boilabin-mark.svg?v=2',
  wordmark: '/assets/brand/boilabin-wordmark-black.svg?v=6',
  wordmarkLight: '/assets/brand/boilabin-wordmark-white.svg?v=6',
  wordmarkFull: '/assets/brand/boilabin-wordmark-black.svg?v=6',
  lockup: '/assets/brand/boilabin-wordmark-black.svg?v=6',
  icons: {
    faviconIco: '/assets/brand/favicons/favicon.ico',
    favicon16: '/assets/brand/favicons/favicon-16x16.png',
    favicon32: '/assets/brand/favicons/favicon-32x32.png',
    appleTouch: '/assets/brand/favicons/apple-touch-icon.png',
    app192: '/assets/brand/favicons/android-chrome-192x192.png',
    app512: '/assets/brand/favicons/android-chrome-512x512.png',
    manifest: '/assets/brand/favicons/site.webmanifest',
    appLight: '/assets/brand/icons/app-icon-light.svg',
    appDark: '/assets/brand/icons/app-icon-dark.svg',
  },
} as const

export const PAYMENT_ASSETS = {
  CASH_ON_DELIVERY: {
    src: '/assets/commerce/payments/cod.svg',
    alt: 'Cash on Delivery',
    width: 52,
    height: 28,
  },
  BKASH: {
    src: '/assets/commerce/payments/bkash.svg',
    alt: 'bKash',
    width: 124,
    height: 114,
  },
  NAGAD: {
    src: '/assets/commerce/payments/nagad.svg',
    alt: 'Nagad',
    width: 89,
    height: 116,
  },
  VISA: {
    src: '/assets/commerce/payments/visa.svg',
    alt: 'Visa',
    width: 1000,
    height: 325,
  },
  MASTERCARD: {
    src: '/assets/commerce/payments/mastercard.svg',
    alt: 'Mastercard',
    width: 1000,
    height: 618,
  },
} as const

export const APP_BADGE_ASSETS = {
  APP_STORE: {
    src: '/assets/commerce/app-badges/app-store-badge.webp',
    alt: 'Download on the App Store',
    width: 350,
    height: 105,
  },
  GOOGLE_PLAY: {
    src: '/assets/commerce/app-badges/google-play-badge.webp',
    alt: 'Get it on Google Play',
    width: 350,
    height: 105,
  },
} as const
