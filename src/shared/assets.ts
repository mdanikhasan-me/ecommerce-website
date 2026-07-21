const BRAND_ASSET_ROOT = '/assets/brand/identity/v20260722'

export const BRAND_ASSETS = {
  mark: `${BRAND_ASSET_ROOT}/svg/boilabin-mark-blue-transparent.svg`,
  markLight: `${BRAND_ASSET_ROOT}/svg/boilabin-mark-white-transparent.svg`,
  wordmark: `${BRAND_ASSET_ROOT}/svg/boilabin-logo-dark-transparent.svg`,
  wordmarkLight: `${BRAND_ASSET_ROOT}/svg/boilabin-logo-light-transparent.svg`,
  wordmarkFull: `${BRAND_ASSET_ROOT}/svg/boilabin-logo-dark-transparent.svg`,
  lockup: `${BRAND_ASSET_ROOT}/svg/boilabin-logo-monochrome-black-transparent.svg`,
  logoMonochromeWhite: `${BRAND_ASSET_ROOT}/svg/boilabin-logo-monochrome-white-transparent.svg`,
  wordmarkMonochromeBlack: `${BRAND_ASSET_ROOT}/svg/boilabin-wordmark-black-transparent.svg`,
  wordmarkMonochromeWhite: `${BRAND_ASSET_ROOT}/svg/boilabin-wordmark-white-transparent.svg`,
  icons: {
    faviconLight: `${BRAND_ASSET_ROOT}/svg/boilabin-favicon-white-bg.svg`,
    faviconDark: `${BRAND_ASSET_ROOT}/svg/boilabin-app-icon-dark-black-bg.svg`,
    faviconIco: `${BRAND_ASSET_ROOT}/icons/favicon.ico`,
    favicon16: `${BRAND_ASSET_ROOT}/icons/favicon-16x16.png`,
    favicon32: `${BRAND_ASSET_ROOT}/icons/favicon-32x32.png`,
    appleTouch: `${BRAND_ASSET_ROOT}/icons/apple-touch-icon.png`,
    app192: `${BRAND_ASSET_ROOT}/icons/android-chrome-192x192.png`,
    app512: `${BRAND_ASSET_ROOT}/icons/android-chrome-512x512.png`,
    manifest: `${BRAND_ASSET_ROOT}/site.webmanifest`,
    appLight: `${BRAND_ASSET_ROOT}/svg/boilabin-app-icon-light-white-bg.svg`,
    appDark: `${BRAND_ASSET_ROOT}/svg/boilabin-app-icon-dark-black-bg.svg`,
    appTransparent: `${BRAND_ASSET_ROOT}/svg/boilabin-app-icon-transparent.svg`,
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
