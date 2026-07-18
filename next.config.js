const os = require('node:os')

function getAllowedDevOrigins() {
  const configuredOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS
  if (configuredOrigins) {
    return configuredOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  }

  return Object.values(os.networkInterfaces())
    .flatMap((entries) => entries ?? [])
    .filter((entry) => entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address)
}

function buildSecurityHeaders() {
  const headers = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-XSS-Protection', value: '0' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    { key: 'Origin-Agent-Cluster', value: '?1' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  ]

  if (process.env.NODE_ENV === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    })
  }

  return headers
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR?.trim() || '.next',
  allowedDevOrigins: getAllowedDevOrigins(),
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  async headers() {
    const privateNoStoreHeaders = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
    ]

    return [
      { source: '/admin/:path*', headers: privateNoStoreHeaders },
      { source: '/account/:path*', headers: privateNoStoreHeaders },
      { source: '/order/:path*', headers: privateNoStoreHeaders },
      { source: '/checkout', headers: privateNoStoreHeaders },
      { source: '/api/admin/:path*', headers: privateNoStoreHeaders },
      { source: '/api/account/:path*', headers: privateNoStoreHeaders },
      { source: '/api/auth/:path*', headers: privateNoStoreHeaders },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: buildSecurityHeaders(),
      },
    ]
  },
  images: {
    localPatterns: [
      { pathname: '/assets/**' },
      { pathname: '/uploads/**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // Keep image optimizer variants tight to avoid repeated paid transforms.
    formats: ['image/webp'],
    qualities: [75, 90],
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 320, 384],
    // Optimize caching
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static images
    // Faster image optimization in dev
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
