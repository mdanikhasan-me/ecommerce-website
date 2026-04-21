import type { Metadata, Viewport } from 'next'
import { DM_Sans, Sora, DM_Mono, Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { BRAND_ASSETS } from '@/shared/assets'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

// Brand display face that matches the BOILABIN wordmark (geometric rounded sans).
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com'),
  icons: {
    icon: [
      { url: BRAND_ASSETS.icons.favicon32, sizes: '32x32', type: 'image/png' },
      { url: BRAND_ASSETS.icons.app512, sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: BRAND_ASSETS.icons.appleTouch, sizes: '180x180', type: 'image/png' },
    ],
    shortcut: BRAND_ASSETS.icons.favicon32,
  },
  title: {
    default: 'Boilabin, Shop Quality Products Online in Bangladesh',
    template: '%s, Boilabin',
  },
  description:
    'Shop electronics, fashion, home appliances and more at the best prices in Bangladesh. Free delivery on orders over Tk 2,000. Cash on delivery, bKash and Nagad accepted.',
  keywords: ['online shopping bangladesh', 'buy online bd', 'best price bangladesh', 'price in bd', 'boilabin'],
  authors: [{ name: 'Boilabin' }],
  creator: 'Boilabin',
  publisher: 'Boilabin',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Boilabin',
    title: 'Boilabin, Shop Quality Products Online in Bangladesh',
    description: 'Shop electronics, fashion, home appliances and more at the best prices in Bangladesh.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@boilabin',
    title: 'Boilabin, Shop Quality Products Online in Bangladesh',
    description: 'Shop electronics, fashion, home appliances and more at the best prices in Bangladesh.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sora.variable} ${poppins.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://utfs.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://utfs.io" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-dm-sans)',
              borderRadius: '8px',
              background: 'hsl(270 36% 18%)',
              color: '#fff',
              fontSize: '13px',
              padding: '10px 16px',
            },
            success: {
              iconTheme: { primary: 'hsl(164 36% 50%)', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
