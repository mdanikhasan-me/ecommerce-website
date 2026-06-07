import { ImageResponse } from 'next/og'

export const alt = 'Boilabin marketplace for Bangladesh'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-between bg-[#1A0F24] p-20 text-[#FAF4E8]">
        <div tw="flex items-center">
          <div tw="mr-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#FAF4E8] text-7xl font-black text-[#452486]">
            B
          </div>
          <div tw="text-6xl font-bold">
            BOILABIN
          </div>
        </div>

        <div tw="flex max-w-[960px] flex-col">
          <div tw="text-7xl font-bold leading-tight">
            A more considered online shopping experience for Bangladesh.
          </div>
          <div tw="mt-4 max-w-[900px] text-3xl text-[#D8C7D6]">
            Product listings, category browsing, and cash on delivery information.
          </div>
        </div>

        <div tw="flex items-center justify-between border-t border-[#FAF4E826] pt-6 text-2xl text-[#B9A6BC]">
          <div>boilabin.com</div>
          <div tw="flex items-center rounded-full border border-[#55B89259] bg-[#55B8922E] px-5 py-2 font-semibold text-[#55B892]">
            Made in Bangladesh
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
