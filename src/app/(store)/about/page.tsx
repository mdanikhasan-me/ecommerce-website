import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About Us | Boilabin' }

export default function AboutPage() {
  return (
    <div className="container-site py-12"><div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-3">About Boilabin</h1>
      <p className="text-muted-foreground mb-8">Bangladesh&apos;s premium online marketplace</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p className="text-base text-foreground font-medium">
          Boilabin is built with one purpose: to give Bangladeshi shoppers a world-class online shopping experience, with premium products, transparent pricing, and service they can trust.
        </p>
        <p>
          Founded in Dhaka, we curate authentic electronics, fashion, home goods, and more from the world&apos;s best brands. Every product we sell is verified for authenticity. Every delivery we make is tracked end-to-end.
        </p>
        <h2 className="font-display text-xl font-semibold text-foreground">Our Promise</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>100% authentic products, always</li>
          <li>Transparent pricing with no hidden fees</li>
          <li>Fast delivery across Bangladesh</li>
          <li>Hassle-free 7-day return policy</li>
          <li>Customer support that actually helps</li>
        </ul>
        <h2 className="font-display text-xl font-semibold text-foreground">Our Vision</h2>
        <p>
          We&apos;re building a marketplace that goes beyond transactions, one that earns your trust every single order. We started as a single store and will grow into a platform where verified sellers across Bangladesh can reach customers who deserve quality.
        </p>
        <p>
          Headquartered in Dhaka, our team is passionate about making premium shopping accessible to everyone in Bangladesh. We&apos;re just getting started.
        </p>
      </div>
    </div></div>
  )
}
