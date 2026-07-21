import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd, generateBreadcrumbJsonLd, generatePageMetadata, generateWebPageJsonLd } from '@/backend/seo'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata('Boilabin Help Center', 'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.', '/help')

const topics = [
  ['Track order', 'Track your order status in real time', '/track-order', 'package'],
  ['Delivery', 'Learn about delivery options and timelines', '/shipping', 'truck'],
  ['Returns', 'Start a return or exchange quickly and easily', '/returns', 'refresh-ccw'],
  ['Payment', 'Accepted methods and payment FAQ', '/payments', 'credit-card'],
  ['Account', 'Manage your account and preferences', '/account', 'user'],
] as const satisfies ReadonlyArray<readonly [string, string, string, StorefrontIconName]>

const questions = [
  ['How do I track my order?', 'Use your Order ID on the Track order page, or sign in and open My Account, then Orders.'],
  ['What payment methods do you accept?', 'Cash on delivery is currently available. Any new method will appear during checkout.'],
  ['Can I change or cancel my order?', 'Contact support as soon as possible with your Order ID. We can help before the order is packed.'],
  ['What should I do if my order is delayed or missing?', 'Check the latest status first, then contact support so we can review the delivery update.'],
  ['What is your return policy?', 'Report damaged, defective, or wrong items quickly with clear proof. Return requests are reviewed against the return policy.'],
  ['How do I add or change my delivery address?', 'Update the saved address in My Account, or contact support before the order is packed.'],
] as const satisfies ReadonlyArray<readonly [string, string]>

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
        <section className="mt-9 grid gap-x-7 gap-y-1 sm:grid-cols-2 lg:grid-cols-5">{topics.map(([title, description, href, icon]) => <Link key={title} href={href} className="flex min-w-0 items-start gap-3 py-4"><LocalIcon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-[#205fc2]" /><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-[#172033]">{title}</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span></span><LocalIcon name="arrow-right" className="mt-1 h-4 w-4 shrink-0 text-[#536176]" /></Link>)}</section>
        <div className="mt-10"><SupportFaqList questions={questions} /></div>
        <div className="mt-7"><SupportContactBar /></div>
      </div>
    </main>
  )
}
