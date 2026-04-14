import type { Metadata, Viewport } from 'next'
import { DM_Sans, Sora, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
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

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com'),
  title: {
    default: 'BoilaBin | Shop Quality Products Online in Bangladesh',
    template: '%s | BoilaBin',
  },
  description: 'Shop electronics, fashion, home appliances & more at the best prices in Bangladesh. Free delivery on orders over ৳2,000. Cash on delivery, bKash & Nagad accepted.',
  keywords: ['online shopping bangladesh', 'buy online bd', 'best price bangladesh', 'price in bd', 'boilabin', 'অনলাইন শপিং বাংলাদেশ'],
  authors: [{ name: 'BoilaBin' }],
  creator: 'BoilaBin',
  publisher: 'BoilaBin',
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'BoilaBin',
    title: 'BoilaBin | Shop Quality Products Online in Bangladesh',
    description: 'Shop electronics, fashion, home appliances & more at the best prices in Bangladesh.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@boilabin',
    title: 'BoilaBin | Shop Quality Products Online in Bangladesh',
    description: 'Shop electronics, fashion, home appliances & more at the best prices in Bangladesh.',
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
    // Add your verification codes here when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
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
    <html lang="en" className={`${dmSans.variable} ${sora.variable} ${dmMono.variable}`} suppressHydrationWarning>
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
