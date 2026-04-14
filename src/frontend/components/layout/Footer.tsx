'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Shield, RefreshCw, Truck, CreditCard } from 'lucide-react'

const TRUST_FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over ৳2,000' },
  { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7 day return policy' },
  { icon: CreditCard, title: 'Multiple Payments', desc: 'bKash, Nagad, Cards, COD' },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      {/* Trust Section */}
      <div className="border-b border-white/10">
        <div className="container-site py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-site py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl">Boilabin</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-sm">
              Bangladesh&apos;s premium online store. Quality products, fast delivery, and a shopping experience you can trust.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a href="mailto:hello@boilabin.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> hello@boilabin.com
              </a>
              <a href="tel:+8801700000000" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> +880 1700 000000
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Dhaka, Bangladesh
              </span>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-white/10 hover:bg-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                ['Help Center', '/help'],
                ['Track My Order', '/track-order'],
                ['Returns & Refunds', '/returns'],
                ['Contact Us', '/contact'],
                ['FAQ', '/faq'],
                ['Shipping Info', '/shipping'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                ['About Us', '/about'],
                ['Terms of Service', '/terms'],
                ['Privacy Policy', '/privacy'],
                ['Refund Policy', '/returns'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Stay Updated</h4>
            <p className="text-sm text-white/60 mb-4">Subscribe for exclusive deals and new arrivals.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:border-primary min-w-0"
              />
              <button type="submit" className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Boilabin. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payments:</span>
            {['COD', 'bKash', 'Nagad', 'Visa', 'MC'].map((p) => (
              <span key={p} className="bg-white/10 px-2 py-0.5 rounded font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
