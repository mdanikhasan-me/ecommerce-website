import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Boilabin marketplace for Bangladesh'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#2D1B3D] via-[#452486] to-[#1A0F24] px-20 py-20 text-[#FAF4E8]">
        <div tw="flex items-center gap-6">
          <div tw="flex h-24 w-24 items-center justify-center rounded-[20px] bg-[#FAF4E8] text-[70px] font-black tracking-[-0.08em] text-[#452486]">
            B
          </div>
          <div tw="text-[56px] font-bold tracking-[-0.04em]">BOILABIN</div>
        </div>

        <div tw="flex flex-col gap-4">
          <div tw="max-w-[960px] text-[72px] font-bold leading-[1.08] tracking-[-0.06em]">
            A more considered online shopping experience for Bangladesh.
          </div>
          <div tw="mt-2 max-w-[900px] text-[28px] text-[#D8C7D6]">
            Authentic products, dependable delivery, and smooth checkout with COD, bKash, and Nagad.
          </div>
        </div>

        <div tw="flex items-center justify-between border-t border-[#FAF4E8]/15 pt-6 text-[22px] text-[#B9A6BC]">
          <div>boilabin.com</div>
          <div tw="inline-flex items-center rounded-full border border-[#55B892]/35 bg-[#55B892]/18 px-[18px] py-2 font-semibold text-[#55B892]">
            Made in Bangladesh
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
