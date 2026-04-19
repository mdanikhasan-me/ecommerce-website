import { Truck, Clock, MapPin, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin Shipping Information' }

const ZONES = [
  { zone: 'Dhaka City', fee: 'Tk 60', time: '1 to 2 days' },
  { zone: 'Dhaka Division', fee: 'Tk 80', time: '2 to 3 days' },
  { zone: 'Chittagong Division', fee: 'Tk 100', time: '2 to 4 days' },
  { zone: 'Other Divisions', fee: 'Tk 120', time: '3 to 5 days' },
]

export default function ShippingPage() {
  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-bold">Shipping Information</h1>
        <p className="mb-8 text-muted-foreground">Everything you need to know about delivery at Boilabin.</p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On all orders over Tk 2,000' },
            { icon: Clock, title: 'Fast Shipping', desc: 'Dhaka city orders in 1 to 2 days' },
            { icon: MapPin, title: 'Nationwide', desc: 'We deliver across all of Bangladesh' },
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
          Orders placed before 2:00 PM are dispatched the same business day. Delivery times are estimates and may vary during holidays or peak seasons.
        </p>
      </div>
    </div>
  )
}
