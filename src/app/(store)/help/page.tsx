import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd, generateBreadcrumbJsonLd, generatePageMetadata, generateWebPageJsonLd } from '@/backend/seo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL } from '@/shared/contact'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata('Boilabin Help Center', 'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.', '/help')

const topics = [
  ['Track order', 'Track your order status in real time', '/track-order', 'package', 'bg-blue-50'],
  ['Delivery', 'Learn about delivery options and timelines', '/shipping', 'truck', 'bg-green-50'],
  ['Returns', 'Start a return or exchange quickly and easily', '/returns', 'refresh-ccw', 'bg-purple-50'],
  ['Payment', 'Accepted methods and payment FAQ', '/payments', 'credit-card', 'bg-amber-50'],
  ['Account', 'Manage your account and preferences', '/account', 'user', 'bg-rose-50'],
] as const satisfies ReadonlyArray<readonly [string, string, string, StorefrontIconName, string]>

const questions = [
  ['How do I track my order?', 'Use your Order ID on the Track order page, or sign in and open My Account, then Orders.'],
  ['What payment methods do you accept?', 'Cash on delivery is currently available. Any new method will appear during checkout.'],
  ['Can I change or cancel my order?', 'Contact support as soon as possible with your Order ID. We can help before the order is packed.'],
  ['What should I do if my order is delayed or missing?', 'Check the latest status first, then contact support so we can review the delivery update.'],
  ['What is your return policy?', 'Report damaged, defective, or wrong items quickly with clear proof. Return requests are reviewed against the return policy.'],
  ['How do I add or change my delivery address?', 'Update the saved address in My Account, or contact support before the order is packed.'],
]

export default function HelpPage() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd data={[generateWebPageJsonLd({ name: 'Boilabin Help Center', description: 'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.', path: '/help' }), generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Help Center', url: '/help' }])]} />
      <div className="container-site py-7 sm:py-9 lg:py-10">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Help Center</h1>
          <p className="mt-3 text-lg font-semibold sm:text-xl">How can we help?</p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Find answers, track your orders, and get the support you need.</p>
          <form action="/help" className="mt-6 grid h-12 grid-cols-[minmax(0,1fr)_6rem] rounded-lg border border-border bg-card p-1 text-left">
            <label className="flex min-w-0 items-center gap-3 px-3" htmlFor="help-search"><LocalIcon name="search" className="h-4 w-4 text-muted-foreground" /><input id="help-search" name="q" type="search" placeholder="Search for help articles, topics, or keywords" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
            <button type="submit" className="rounded-md bg-[#121212] text-sm font-semibold text-white">Search</button>
          </form>
        </section>
        <section className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{topics.map(([title, description, href, icon, tone]) => <Link key={title} href={href} className="flex min-w-0 items-center gap-4 rounded-lg px-3 py-3"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone}`}><LocalIcon name={icon} className="h-7 w-7" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span></span><LocalIcon name="chevron-right" className="h-4 w-4 shrink-0 text-muted-foreground" /></Link>)}</section>
        <section className="mt-10"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">FAQ</h2><Link href="/articles" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold">More FAQ <LocalIcon name="arrow-right" className="h-4 w-4" /></Link></div><div className="mt-3 divide-y divide-border">{questions.map(([question, answer]) => <details key={question} className="group"><summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span>{question}</span><LocalIcon name="chevron-down" className="h-4 w-4 group-open:rotate-180" /></summary><p className="max-w-3xl pb-4 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div></section>
        <section className="mt-7 grid gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50"><LocalIcon name="headset" className="h-6 w-6" /></span><span><strong className="block text-sm">Need more help?</strong><span className="mt-1 block text-sm text-muted-foreground">Our support team is here to help with any questions.</span><Link href="/contact" className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-[#121212] px-4 text-sm font-semibold text-white">Contact support <LocalIcon name="arrow-right" className="h-4 w-4" /></Link></span></div><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><LocalIcon name="mail" className="h-6 w-6" /></span><span><strong className="block text-sm">Email us</strong><span className="mt-1 block text-sm text-muted-foreground">We typically respond within 24 hours.</span><a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-foreground"><LocalIcon name="mail" className="h-4 w-4" />{CONTACT_EMAIL}</a></span></div></section>
      </div>
    </main>
  )
}
