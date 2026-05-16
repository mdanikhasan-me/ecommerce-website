import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CreditCard,
  PackageCheck,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import type { Metadata } from 'next'

import { generatePageMetadata } from '@/backend/seo'
import { BRAND_ASSETS } from '@/shared/assets'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Help Center',
  'Find help with Boilabin orders, delivery, returns, payments, accounts, and support requests.',
  '/help',
)

const HELP_LINKS = [
  { icon: PackageCheck, label: 'Track order', href: '/track-order' },
  { icon: RefreshCcw, label: 'Returns', href: '/returns' },
  { icon: Truck, label: 'Shipping', href: '/shipping' },
  { icon: CreditCard, label: 'Payments', href: '/faq#payments' },
  { icon: ShieldCheck, label: 'Account help', href: '/faq#account' },
]

export default function HelpPage() {
  return (
    <main className="bg-background">
      <section className="container-site py-8 sm:py-10 lg:py-12">
        <div className="overflow-hidden rounded-[2rem] bg-[#17111b] text-white shadow-[0_24px_80px_rgba(28,15,35,0.18)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative p-6 sm:p-9 lg:p-12">
              <Image
                src={BRAND_ASSETS.mark}
                alt=""
                width={260}
                height={180}
                className="pointer-events-none absolute -right-14 top-8 h-auto w-56 opacity-[0.08] sm:w-72 lg:right-8"
                priority
              />

              <div className="relative max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
                  Boilabin Support
                </p>
                <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.35rem] lg:leading-[0.9]">
                  Help that feels built for your order.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/[0.72] sm:text-base">
                  Delivery, returns, payments, and account help in one calm place.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/track-order" className="btn-primary justify-center bg-white text-[#241232] hover:bg-white/90">
                    Track My Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="btn-outline justify-center border-white/20 bg-white/[0.05] text-white hover:bg-white/10"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              <div className="relative mt-9 grid gap-3 sm:grid-cols-3">
                {[
                  ['Support hours', '24/7'],
                  ['Delivery', 'Anywhere'],
                  ['Direct reply', CONTACT_EMAIL],
                ].map(([label, value]) => (
                  <div key={label} className="border-l border-white/[0.15] pl-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{label}</p>
                    <p className="mt-2 break-words text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-t border-white/10 bg-[#211927] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex h-full flex-col justify-between gap-7">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.45]">
                    Support Desk
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
                    Choose the next step.
                  </h2>

                  <div className="mt-6 divide-y divide-white/10 rounded-[1.35rem] border border-white/10 bg-white/[0.05]">
                    {HELP_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center justify-between gap-4 px-4 py-4"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#28133a]">
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="truncate text-sm font-semibold text-white">{item.label}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-white/[0.45] transition-transform group-hover:translate-x-1 group-hover:text-white" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-[#17111b] p-4">
                  <p className="text-sm font-semibold text-white">Need a direct reply?</p>
                  <p className="mt-2 text-sm leading-6 text-white/[0.72]">
                    Send the order number and issue from the contact page.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <Link href="/contact" className="btn-primary justify-center bg-white text-[#241232] hover:bg-white/90">
                      Contact Us
                    </Link>
                    <a
                      href={`tel:${CONTACT_PHONE}`}
                      className="btn-outline justify-center border-white/20 bg-white/[0.05] text-white hover:bg-white/10"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="pb-8 lg:pb-12" />
    </main>
  )
}
