import type { Metadata, Viewport } from 'next'
import { BRAND_ASSETS } from '@/shared/assets'
import { getSiteUrl } from '@/backend/seo'
import { DeferredToaster } from '@/frontend/components/ui/DeferredToaster'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  manifest: BRAND_ASSETS.icons.manifest,
  icons: {
    icon: [
      { url: BRAND_ASSETS.icons.faviconIco, sizes: 'any' },
      { url: BRAND_ASSETS.icons.favicon32, sizes: '32x32', type: 'image/png' },
      { url: BRAND_ASSETS.icons.favicon16, sizes: '16x16', type: 'image/png' },
      { url: BRAND_ASSETS.icons.app192, sizes: '192x192', type: 'image/png' },
      { url: BRAND_ASSETS.icons.app512, sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: BRAND_ASSETS.icons.appleTouch,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: BRAND_ASSETS.icons.faviconIco,
  },
  title: {
    default: 'Boilabin, Online Shopping in Bangladesh',
    template: '%s, Boilabin',
  },
  description:
    'Browse electronics, fashion, home appliances, and everyday products in Bangladesh. Orders over Tk 5,000 qualify for free delivery, and cash on delivery is available.',
  keywords: [
    'online shopping bangladesh',
    'buy online bd',
    'product price bangladesh',
    'price in bd',
    'boilabin',
  ],
  authors: [{ name: 'Boilabin' }],
  creator: 'Boilabin',
  publisher: 'Boilabin',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: getSiteUrl(),
    siteName: 'Boilabin',
    title: 'Boilabin, Online Shopping in Bangladesh',
    description:
      'Browse electronics, fashion, home appliances, and everyday products in Bangladesh.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@boilabin',
    title: 'Boilabin, Online Shopping in Bangladesh',
    description:
      'Browse electronics, fashion, home appliances, and everyday products in Bangladesh.',
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
  verification: {},
}

export const viewport: Viewport = {
  themeColor: '#2D1B3D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground"
      >
        {children}
        <DeferredToaster />
      </body>
    </html>
  )
}
