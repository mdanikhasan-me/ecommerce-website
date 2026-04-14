import { Truck, Clock, MapPin, CreditCard } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping Info | Boilabin' }

const ZONES = [
  { zone: 'Dhaka City', fee: '৳60', time: '1 to 2 days' },
  { zone: 'Dhaka Division', fee: '৳80', time: '2 to 3 days' },
  { zone: 'Chittagong Division', fee: '৳100', time: '2 to 4 days' },
  { zone: 'Other Divisions', fee: '৳120', time: '3 to 5 days' },
]

export default function ShippingPage() {
  return (
    <div className="container-site py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Shipping Information</h1>
        <p className="text-muted-foreground mb-8">Everything you need to know about delivery at Boilabin.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On all orders over ৳2,000' },
            { icon: Clock, title: 'Fast Shipping', desc: 'Dhaka city orders in 1 to 2 days' },
            { icon: MapPin, title: 'Nationwide', desc: 'We deliver across all of Bangladesh' },
            { icon: CreditCard, title: 'COD Available', desc: 'Cash on delivery at no extra cost' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-xl font-semibold mb-4">Delivery Zones & Rates</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 font-semibold">Zone</th>
                <th className="text-left px-5 py-3 font-semibold">Delivery Fee</th>
                <th className="text-left px-5 py-3 font-semibold">Estimated Time</th>
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

        <p className="text-xs text-muted-foreground mt-4">
          Orders placed before 2:00 PM are dispatched the same business day. Delivery times are estimates and may vary during holidays or peak seasons.
        </p>
      </div>
    </div>
  )
}
