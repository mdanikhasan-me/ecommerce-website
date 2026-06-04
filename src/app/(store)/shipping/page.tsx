import { Truck, Clock, MapPin, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { siteConfig } from '@/backend/config/site'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Shipping Information',
  `Boilabin delivery costs Tk ${siteConfig.shipping.baseFee}, with free shipping on orders over Tk ${siteConfig.shipping.freeShippingMin.toLocaleString('en-BD')}.`,
  '/shipping',
)

const ZONES = [
  { zone: 'Bangladesh', fee: `Tk ${siteConfig.shipping.baseFee}`, time: '1 to 5 days' },
  { zone: `Orders over Tk ${siteConfig.shipping.freeShippingMin.toLocaleString('en-BD')}`, fee: 'Free', time: '1 to 5 days' },
]

export default function ShippingPage() {
  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-bold">Shipping Information</h1>
        <p className="mb-8 text-muted-foreground">Everything you need to know about delivery at Boilabin.</p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Truck, title: 'Free Delivery Threshold', desc: `On orders over Tk ${siteConfig.shipping.freeShippingMin.toLocaleString('en-BD')}` },
            { icon: Clock, title: 'Delivery Estimates', desc: 'Delivery timing depends on the order address' },
            { icon: MapPin, title: 'Simple Rate', desc: `Tk ${siteConfig.shipping.baseFee} for paid delivery` },
            { icon: CreditCard, title: 'COD Available', desc: 'Cash on delivery at no extra cost' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-4 font-display text-xl font-semibold">Delivery Zones and Rates</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-3 text-left font-semibold">Zone</th>
                <th className="px-5 py-3 text-left font-semibold">Delivery Fee</th>
                <th className="px-5 py-3 text-left font-semibold">Estimated Time</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.zone} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{z.zone}</td>
                  <td className="px-5 py-3 font-medium">{z.fee}</td>
                  <td className="px-5 py-3 text-muted-foreground">{z.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Delivery times are estimates and may vary by address, holidays, order volume, and fulfillment availability.
        </p>
      </div>
    </div>
  )
}
