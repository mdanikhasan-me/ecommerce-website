# Step 204 - Structured Data Claim Fact Matrix

## Scope

This matrix records decisions before source edits.

| Claim | Schema surface | Current source | Visible page support | Data support | Owner-policy support | Risk | Decision | Code change needed | Test needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product name | Product | Product input | Yes | Yes | Yes | Low | Keep | No | Existing/targeted |
| Product description | Product | Product input | Yes, if product page shows same description | Yes | Depends on product data quality | Medium | Keep data-driven | No | Guard against schema-level hype |
| Product image | Product | Product image input | Yes | Yes | Yes | Low | Keep | No | Existing |
| Product SKU/slug fallback | Product | SKU or slug | URL/product data | Yes | Yes | Low | Keep | No | Assert no GTIN/MPN invented |
| GTIN/MPN | Product | Not present | No | No | No | High | Keep absent | No | Yes |
| Official brand relationship | Product | Not present | No | No | No | High | Keep absent | No | Yes |
| Authenticity guarantee | Product/social | OpenGraph image currently says authentic | No approved verification process | No | No | High | Remove/soften | Yes | Yes |
| Product price | Offer | Product price input | Yes | Yes | Yes | Low | Keep | No | Existing |
| Currency BDT | Offer | Constant | Yes, site is Bangladesh/BDT | Yes | Yes | Low | Keep | No | Existing |
| Availability | Offer | Product visibility helper | Yes, product data | Yes | Yes | Low | Keep | No | Existing |
| Seller organization name | Offer | SEO organization name | Site identity | Yes | Yes | Low | Keep | No | Yes, no marketplace overclaim |
| Shipping base rate | OfferShippingDetails | `siteConfig.shipping.baseFee` | Shipping page says Tk 60 | Yes | Yes | Medium | Keep conservative base rate | No | Yes |
| Shipping destination Bangladesh | OfferShippingDetails | Hard-coded BD | Shipping page uses Bangladesh zone | Yes | Yes | Medium | Keep | No | Yes |
| Exact handling/transit days | ShippingDeliveryTime | Hard-coded 1-2 and 2-5 | Visible page gives estimates only and no split | No | Unknown | High | Remove | Yes | Yes |
| Seven-day return window | MerchantReturnPolicy | Hard-coded 7 | FAQ says seven-day return window | Yes | Yes | Medium | Keep and align returns page | Yes | Yes |
| Return by mail | MerchantReturnPolicy | Hard-coded `ReturnByMail` | Returns page says pickup or return instructions, not mail | No | Unknown | High | Remove | Yes | Yes |
| Return fees | MerchantReturnPolicy | Not present | Not specified | No | Unknown | Medium | Keep absent | No | Future policy |
| Online payment providers | OnlineStore/metadata | Not present in schema; keywords mention bKash | FAQ says online options appear only when available | No live payment confirmed | No | High | Do not add | No | Yes |
| Cash on Delivery | OnlineStore/FAQ/shipping | Visible FAQ/shipping | Yes | Yes | Yes | Low | Keep | No | Yes |
| Aggregate rating | Product | Rating and review count inputs | Only if product page has data | Yes when input exists | Yes | Low | Keep gated | No | Existing/targeted |
| Individual reviews | Product | Reviews input | Only if product page has data | Yes when input exists | Yes | Low | Keep gated | No | Existing/targeted |
| Organization contact | Organization | Shared contact constants | Contact/support pages | Yes | Yes | Low | Keep | No | Optional |
| Social profiles | Organization | Empty `sameAs` | No profiles approved | No | No | Medium | Keep empty | No | Optional |
| WebSite SearchAction | WebSite | Canonical `/search` template | Search route exists | Yes | Yes | Low | Keep | No | Yes |
| FAQ answers | FAQPage | Visible FAQ array | Yes | Yes | Yes | Low | Keep visible-only | No | Optional |
| Breadcrumb links | BreadcrumbList | Breadcrumb input | Yes | Yes | Yes | Low | Keep | No | Existing |
| Category ItemList | ItemList | Visible product list input | Yes | Yes | Yes | Low | Keep | No | Existing |
| Social preview site summary | OpenGraph image | Static text | Partially; current wording overclaims authenticity/smooth checkout | No | No | Medium | Soften to factual copy | Yes | Yes |

## Final Decision Before Source Edits

Proceed with narrow factual alignment:

- Remove unsupported exact shipping delivery timing from schema.
- Remove unsupported mail-return method from schema.
- Keep seven-day return window because visible FAQ supports it and align returns page wording.
- Replace social preview authenticity/smooth-checkout wording with factual catalog/COD wording.
- Harden tests and scanner classification.
- Do not add new schema claims.
