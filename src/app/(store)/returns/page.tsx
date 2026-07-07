import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Fragment } from 'react'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Headphones,
  Package,
  RefreshCcw,
  Shield,
  Tag,
  Truck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Returns Made Simple',
  'Boilabin accepts seven-day returns for defective or damaged items. Learn what is covered, what proof is needed, and how refunds or replacements are handled.',
  '/returns',
)

type SummaryItem = {
  icon: LucideIcon
  title: string
  copy: string
}

type ProcessStep = {
  icon: LucideIcon
  title: string
  copy: string
}

type PolicyList = {
  icon: LucideIcon
  title: string
  tone: 'positive' | 'negative'
  items: Array<{
    icon: LucideIcon
    text: string
  }>
}

const SUMMARY_ITEMS: SummaryItem[] = [
  {
    icon: CalendarDays,
    title: 'Window',
    copy: '7 days from delivery date',
  },
  {
    icon: Package,
    title: 'Covers',
    copy: 'Defective items and delivery damage',
  },
  {
    icon: RefreshCcw,
    title: 'Resolution',
    copy: 'Refund or replacement',
  },
]

const PROCESS_STEPS: ProcessStep[] = [
  {
    icon: Package,
    title: 'Check eligibility',
    copy: 'Item is defective or damaged during delivery. You are eligible for a return within 7 days.',
  },
  {
    icon: ClipboardList,
    title: 'Submit request',
    copy: 'Go to My Account, then Orders, and request a return. Share clear photos or video proof.',
  },
  {
    icon: UserRound,
    title: 'Review',
    copy: 'Our team reviews your request and confirms the next steps.',
  },
  {
    icon: Truck,
    title: 'Return & inspection',
    copy: 'If approved, we arrange a return or pickup and inspect the item after receiving it.',
  },
  {
    icon: CheckCircle2,
    title: 'Resolution',
    copy: 'Choose a refund or replacement. We process your option as quickly as possible.',
  },
]

const POLICY_LISTS: PolicyList[] = [
  {
    icon: CheckCircle2,
    title: 'What you can return',
    tone: 'positive',
    items: [
      { icon: Package, text: 'Defective items that do not work as described' },
      { icon: Truck, text: 'Items damaged during delivery' },
      { icon: Check, text: 'Requests with clear proof of the issue and packaging' },
    ],
  },
  {
    icon: X,
    title: 'What is not covered',
    tone: 'negative',
    items: [
      { icon: CalendarDays, text: 'Requests made after 7 days from delivery' },
      { icon: Tag, text: 'Change of mind, wrong size or items no longer needed' },
      { icon: X, text: 'Items without proof of defect or delivery damage' },
      { icon: Shield, text: 'Damage caused by use, mishandling or accidents after delivery' },
    ],
  },
]

function SummaryCard({ item }: { item: SummaryItem }) {
  const Icon = item.icon

  return (
    <div className="flex min-w-0 items-center gap-4 px-5 py-4 lg:px-7">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef5f1] text-foreground">
        <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-5 text-foreground">{item.title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.copy}</p>
      </div>
    </div>
  )
}

function ProcessStepCard({ step, index }: { step: ProcessStep; index: number }) {
  const Icon = step.icon

  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-[1.5rem_minmax(0,1fr)] gap-3 lg:block lg:text-center">
      <span className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background lg:mx-auto lg:mt-0">
        {index + 1}
      </span>
      <div className="flex min-w-0 max-w-full items-start gap-3 lg:mt-4 lg:block">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f5f2] text-foreground lg:mx-auto lg:h-14 lg:w-14">
          <Icon aria-hidden="true" className="h-5 w-5 lg:h-7 lg:w-7" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-5 text-foreground lg:mt-4">{step.title}</h3>
          <p className="mt-1 min-w-0 max-w-full break-words text-sm leading-6 text-muted-foreground lg:mx-auto lg:mt-2 lg:max-w-[12.5rem]">
            {step.copy}
          </p>
        </div>
      </div>
    </div>
  )
}

function PolicyCard({ list }: { list: PolicyList }) {
  const isPositive = list.tone === 'positive'
  const HeaderIcon = list.icon

  return (
    <section
      className={
        isPositive
          ? 'rounded-lg border border-[#dfeee5] bg-[#f6fbf8] p-6'
          : 'rounded-lg border border-[#f2dcdd] bg-[#fff7f7] p-6'
      }
    >
      <div className="flex items-center gap-4">
        <span
          className={
            isPositive
              ? 'flex h-10 w-10 items-center justify-center rounded-full border border-[#a8d7bb] bg-white text-[#24724d]'
              : 'flex h-10 w-10 items-center justify-center rounded-full border border-[#f0b7bb] bg-white text-[#db444b]'
          }
        >
          <HeaderIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <h2 className="text-base font-semibold leading-6 text-foreground">{list.title}</h2>
      </div>
      <ul className="mt-5 space-y-4">
        {list.items.map((item) => (
          <li key={item.text} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-muted-foreground">
            <item.icon
              aria-hidden="true"
              className={isPositive ? 'mt-0.5 h-4 w-4 text-[#24724d]' : 'mt-0.5 h-4 w-4 text-[#db444b]'}
              strokeWidth={1.85}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MobilePolicyDetails({ list }: { list: PolicyList }) {
  const isPositive = list.tone === 'positive'
  const HeaderIcon = list.icon

  return (
    <details
      className={
        isPositive
          ? 'group rounded-lg border border-[#dfeee5] bg-[#f6fbf8]'
          : 'group rounded-lg border border-[#f2dcdd] bg-[#fff7f7]'
      }
    >
      <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-3 px-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        <span
          className={
            isPositive
              ? 'flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#24724d]'
              : 'flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#db444b]'
          }
        >
          <HeaderIcon aria-hidden="true" className="h-4 w-4" strokeWidth={1.85} />
        </span>
        <span>{list.title}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 justify-self-end text-muted-foreground" strokeWidth={1.85} />
      </summary>
      <ul className="space-y-3 px-4 pb-4 pl-[4.5rem]">
        {list.items.map((item) => (
          <li
            key={item.text}
            className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-muted-foreground"
          >
            <item.icon
              aria-hidden="true"
              className={
                isPositive ? 'mt-1 h-4 w-4 text-[#24724d]' : 'mt-1 h-4 w-4 text-[#db444b]'
              }
              strokeWidth={1.85}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}

export default function ReturnsPage() {
  return (
    <main className="overflow-x-hidden bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Returns Made Simple',
            description: 'Boilabin accepts seven-day returns for defective or damaged items. Learn what is covered, what proof is needed, and how refunds or replacements are handled.',
            path: '/returns',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Returns', url: '/returns' },
          ]),
        ]}
      />

      <div className="container-site min-w-0 max-w-full py-8 sm:py-10 lg:py-12">
        <section className="grid min-w-0 max-w-full gap-4 sm:gap-5 md:grid-cols-[minmax(0,0.84fr)_minmax(20rem,0.76fr)] md:items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.72fr)]">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-display text-[2.25rem] font-bold leading-[0.95] tracking-normal text-foreground sm:text-[3.15rem] md:text-[3.65rem] lg:text-[4.6rem]">
              Returns
              <br />
              Made Simple
            </h1>
            <p className="mt-5 max-w-[28rem] text-base font-semibold leading-7 text-foreground sm:text-lg">
              Seven-day returns for defective or damaged items.
            </p>
            <p className="mt-4 max-w-[32rem] text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              If your order arrives defective or damaged, you can request a return within 7 days of
              delivery with clear proof of the issue.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[19rem] sm:max-w-[27rem] md:max-w-[32rem] lg:max-w-[38rem]">
            <Image
              src="/assets/returns/returns-box.webp"
              alt="Boilabin package box for returns"
              width={600}
              height={400}
              priority
              sizes="(min-width: 1024px) 38rem, 92vw"
              className="mx-auto h-auto w-full object-contain"
            />
          </div>
        </section>

        <section className="mt-8 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-[#f5f5f2] lg:mt-10">
          <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {SUMMARY_ITEMS.map((item) => (
              <SummaryCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-10 w-full min-w-0 max-w-full lg:mt-12">
          <div className="flex items-center gap-6">
            <span className="hidden h-px flex-1 bg-border sm:block" />
            <h2 className="shrink-0 text-center text-xl font-semibold leading-7 text-foreground">How it works</h2>
            <span className="hidden h-px flex-1 bg-border sm:block" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)] lg:items-start lg:gap-4">
            {PROCESS_STEPS.map((step, index) => (
              <Fragment key={step.title}>
                <ProcessStepCard step={step} index={index} />
                {index < PROCESS_STEPS.length - 1 ? (
                  <>
                    <ArrowDown
                      aria-hidden="true"
                      className="h-5 w-5 justify-self-center text-muted-foreground lg:hidden"
                      strokeWidth={1.7}
                    />
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-[4.1rem] hidden h-5 w-5 self-start justify-self-center text-muted-foreground lg:block"
                      strokeWidth={1.7}
                    />
                  </>
                ) : null}
              </Fragment>
            ))}
          </div>
        </section>

        <section className="mt-10 hidden grid-cols-2 gap-5 lg:grid">
          {POLICY_LISTS.map((list) => (
            <PolicyCard key={list.title} list={list} />
          ))}
        </section>

        <section className="mt-8 space-y-3 lg:hidden">
          {POLICY_LISTS.map((list) => (
            <MobilePolicyDetails key={list.title} list={list} />
          ))}
        </section>

        <section className="mt-6 grid w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-[#f7f7f4] md:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)] md:items-center">
          <div className="relative min-h-[13rem] overflow-hidden bg-[#ece9e3] sm:min-h-[16rem] md:min-h-[14rem]">
            <Image
              src="/assets/returns/refund-replacement.webp"
              alt="Refund and replacement illustration"
              fill
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="p-6 sm:p-7 lg:p-8">
            <h2 className="text-lg font-semibold leading-7 text-foreground">Refunds & replacements</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              For cash on delivery orders, we confirm the refund method after inspection. A
              replacement is shipped once the request is approved and stock is confirmed.
            </p>
          </div>
        </section>

        <section className="mt-6 w-full min-w-0 max-w-full rounded-md border border-[#252128] bg-[#141218] px-5 py-4 text-white sm:px-6">
          <div className="border-l-2 border-[#c89d4a] pl-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#c89d4a]">
              Please note
            </p>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-white/88">
              Refunds start after return inspection. COD refunds take 1-3 business days to bank or
              MFS; online and card refunds usually take 7-12 business days through the payment
              gateway.
            </p>
          </div>
        </section>

        <section className="mt-6 grid w-full min-w-0 max-w-full gap-5 rounded-lg border border-border bg-white p-6 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:p-8">
          <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef5f1] text-foreground">
              <Headphones aria-hidden="true" className="h-6 w-6" strokeWidth={1.85} />
            </span>
            <div>
              <h2 className="text-lg font-semibold leading-7 text-foreground">Need help?</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                To start a return or ask a question, reach out to us. We are here to help.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center gap-3 rounded-md bg-foreground px-6 text-sm font-semibold text-background focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Contact Us
            <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.85} />
          </Link>
        </section>
      </div>
    </main>
  )
}
