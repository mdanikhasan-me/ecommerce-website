import type { Metadata } from 'next'
import { RefreshCcw, CheckCircle, XCircle, Clock } from 'lucide-react'
export const metadata: Metadata = { title: 'Returns & Refund Policy | Boilabin' }
export default function ReturnsPage() {
  return (
    <div className="container-site py-12">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Returns & Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Simple, fair, and hassle-free.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Clock, title: '7-Day Window', desc: 'Return within 7 days of delivery' },
            { icon: CheckCircle, title: 'Easy Process', desc: 'Just raise a request online' },
            { icon: RefreshCcw, title: 'Fast Refunds', desc: 'Processed within 3–5 business days' },
          ].map((f) => (
            <div key={f.title} className="bg-secondary rounded-2xl p-5 text-center">
              <f.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="font-display text-xl font-semibold text-foreground">Eligible for Return</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Item received damaged or defective</li>
            <li>Wrong item delivered</li>
            <li>Item significantly different from description</li>
            <li>Unopened/unused items in original packaging (within 7 days)</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-foreground">Not Eligible for Return</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Items returned after 7 days of delivery</li>
            <li>Items without original packaging or accessories</li>
            <li>Items damaged by customer misuse</li>
            <li>Perishable goods, software, and digital products</li>
            <li>Undergarments and intimate apparel for hygiene reasons</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-foreground">How to Return</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to My Account &gt; Orders &gt; Select Order</li>
            <li>Click &quot;Request Return&quot; and select a reason</li>
            <li>Our team will review within 24 hours</li>
            <li>If approved, we&apos;ll arrange pickup at no cost</li>
            <li>Refund is processed after item inspection</li>
          </ol>

          <h2 className="font-display text-xl font-semibold text-foreground">Refund Timeline</h2>
          <div className="bg-secondary rounded-2xl p-5 space-y-2 text-sm">
            {[
              ['bKash / Nagad', '1–2 business days'],
              ['Bank Transfer', '3–5 business days'],
              ['Credit / Debit Card', '5–7 business days'],
              ['Cash on Delivery', 'Bank transfer within 3–5 days'],
            ].map(([method, time]) => (
              <div key={method} className="flex justify-between">
                <span>{method}</span>
                <span className="font-medium text-foreground">{time}</span>
              </div>
            ))}
          </div>

          <p className="text-sm">For return requests, contact: returns@boilabin.com or call +880 1700-000000</p>
        </div>
      </div>
    </div>
  )
}
