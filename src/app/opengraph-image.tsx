import { ImageResponse } from 'next/og'

export const alt = 'Boilabin marketplace for Bangladesh'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #2D1B3D 0%, #452486 52%, #1A0F24 100%)',
          padding: 80,
          color: '#FAF4E8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              height: 96,
              width: 96,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              background: '#FAF4E8',
              color: '#452486',
              fontSize: 70,
              fontWeight: 900,
              letterSpacing: '-0.08em',
            }}
          >
            B
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em' }}>
            BOILABIN
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              maxWidth: 960,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.06em',
            }}
          >
            A more considered online shopping experience for Bangladesh.
          </div>
          <div style={{ marginTop: 8, maxWidth: 900, color: '#D8C7D6', fontSize: 28 }}>
            Authentic products, dependable delivery, and smooth checkout with cash on delivery.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(250, 244, 232, 0.15)',
            paddingTop: 24,
            color: '#B9A6BC',
            fontSize: 22,
          }}
        >
          <div>boilabin.com</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid rgba(85, 184, 146, 0.35)',
              background: 'rgba(85, 184, 146, 0.18)',
              padding: '8px 18px',
              color: '#55B892',
              fontWeight: 600,
            }}
          >
            Made in Bangladesh
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
