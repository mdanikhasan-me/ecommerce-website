import type { Metadata } from 'next'
import {
  generatePageMetadata,
  JsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
  generateWebPageJsonLd,
} from '@/backend/seo'

export const metadata: Metadata = generatePageMetadata(
  'About Boilabin',
  'Boilabin is a focused Bangladesh marketplace where products and sellers are reviewed before they reach customers.',
  '/about',
)

export default function AboutPage() {
  return (
    <main className="bg-white">
      <JsonLd
        data={[
          generateOrganizationJsonLd(),
          generateWebPageJsonLd({
            type: 'AboutPage',
            name: 'About Boilabin',
            description:
              'Boilabin is a focused Bangladesh marketplace where products and sellers are reviewed before they reach customers.',
            path: '/about',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]),
        ]}
      />

      <div className="container-site py-8 sm:py-10 lg:py-14">
        <article className="w-full max-w-none text-[#111827]">
          <h1 className="font-display text-[2.4rem] font-semibold leading-tight tracking-normal sm:text-[3rem]">
            About
          </h1>

          <p className="mt-6 text-[1.03rem] leading-8 text-[#374151]">
            Boilabin sells across a small set of categories: electronics, fashion, home, beauty, fitness, books,
            gaming, and toys. That list is not meant to be complete. It is meant to be a list we are willing to stand
            behind, where every product has been reviewed before it reaches a customer.
          </p>

          <h2 className="mt-10 text-xl font-semibold leading-7 text-[#111827]">The Founder&apos;s Story</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">
            I have bought enough things online in Bangladesh to recognize the pattern by now. Search for a single
            item, and the results return the same product from a dozen different sellers, at a dozen different prices,
            in what turn out to be a dozen different actual qualities. Some of what I received held up. A great deal
            of it did not, and the listing photo rarely gave that away in advance. I would only find out once the item
            had already arrived, and often only after I had already paid.
          </p>

          <p className="mt-5 text-[1.03rem] leading-8 text-[#374151]">
            Browsing itself was no easier. Every page I opened carried banners, countdown timers, coin rewards, and
            discounts that reset the moment my attention moved elsewhere. There was a great deal happening on screen
            and very little certainty about what would actually turn up at my door.
          </p>

          <p className="mt-5 text-[1.03rem] leading-8 text-[#374151]">
            That contradiction is where Boilabin began for me: not an attempt to build a larger version of what
            already existed, but a smaller one I could actually answer for, product by product and seller by seller.
          </p>

          <h2 className="mt-10 text-xl font-semibold leading-7 text-[#111827]">What Actually Gets Listed</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">
            Every product and every seller is reviewed personally before it goes live, not against a policy written
            somewhere on the site, but through an actual check, applied the same way each time. Where the quality does
            not hold up, or a listing presents something ordinary as though it were exceptional, it is not published.
            It is a slower way to build a catalog than opening the platform to anyone with something to sell, and it
            remains the only way we know to keep a small selection from feeling cheap.
          </p>

          <p className="mt-5 text-[1.03rem] leading-8 text-[#374151]">
            Pricing is treated with the same care. A listing is not permitted to invent a higher &quot;original&quot; price
            simply to appear discounted. Where a seller attempts this, the listing is corrected or removed, reviewed
            case by case rather than left to an automated rule.
          </p>

          <h2 className="mt-10 text-xl font-semibold leading-7 text-[#111827]">On Sellers</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">
            Most of what is available today has been sourced and sold directly by us. That is intentional. As brands
            and small businesses that meet the same standard come forward, they are welcome to apply, with
            documentation reviewed first and a place granted only once the quality behind it is genuine. A seller earns
            a place here in much the same way a product does.
          </p>

          <h2 className="mt-10 text-xl font-semibold leading-7 text-[#111827]">If It Is Not Here Yet</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">
            If something you want simply is not available in Bangladesh, you may request it as a preorder. We look into
            what it would take to bring it to you properly, whether through an official distributor where one exists,
            or by importing it ourselves where one does not. It will not be possible for every product, but the option
            is genuine, not a form that quietly leads nowhere.
          </p>

          <p className="mt-5 text-[1.03rem] leading-8 text-[#374151]">
            Boilabin does not aim to carry everything. It aims to ensure that what it does carry can be trusted: the
            seller behind it, the price attached to it, and what is finally in the box.
          </p>
        </article>
      </div>
    </main>
  )
}
