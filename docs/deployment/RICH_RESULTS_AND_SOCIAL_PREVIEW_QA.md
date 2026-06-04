# Rich Results And Social Preview QA

## Purpose

This document defines future QA for structured data and social previews. It does not run external validators or claim eligibility.

## Rich Results QA

Use hosted, anonymously reachable pages when available.

| Page type | Tool | What to check | Evidence |
| --- | --- | --- | --- |
| Homepage | Google Rich Results Test, Schema.org Validator | Organization, WebSite, OnlineStore | screenshot/result URL |
| Product page | Google Rich Results Test, Schema.org Validator | Product, Offer, price, availability, image, shipping/return facts | screenshot/result URL |
| Category page | Schema.org Validator | ItemList and product URLs | screenshot/result URL |
| FAQ page | Schema.org Validator | FAQPage mirrors visible FAQ | screenshot/result URL |
| Breadcrumbs | Rich Results Test when visible in product/category pages | BreadcrumbList URLs and names | screenshot/result URL |

Warnings should be triaged separately from errors. Missing optional fields are not automatically launch blockers if the underlying business facts are unavailable.

## Social Preview QA

| Surface | What to check | Evidence |
| --- | --- | --- |
| Open Graph title | factual title, no hype | preview screenshot |
| Open Graph description | factual description, no unsupported trust/payment/shipping claims | preview screenshot |
| Open Graph image | 1200 x 630 output, readable text, no unsupported claims | preview screenshot |
| Twitter/X card | large summary card behavior | preview screenshot |
| Facebook/LinkedIn preview | image and copy render as expected | preview screenshot |

Run preview checks against staging only if the tool can access staging without exposing secrets. Run final checks against production after the domain is connected.

## Do Not Claim

- Rich result display is guaranteed.
- A warning-free validator means ranking will improve.
- Social previews are final before the production domain is connected.
- Payment provider, authenticity, or delivery-speed claims are supported unless visible and current.
