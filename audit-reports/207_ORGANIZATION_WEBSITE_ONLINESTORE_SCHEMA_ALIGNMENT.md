# Step 207 - Organization, WebSite, And OnlineStore Schema Alignment

## Scope

Reviewed Organization, WebSite, and OnlineStore JSON-LD in `src/backend/seo/structured-data.ts`, with constants from `src/backend/seo/constants.ts` and `src/backend/config/site.ts`.

## Inventory

| Surface | Result | Decision |
| --- | --- | --- |
| Organization name/legalName | Uses Boilabin | Keep |
| Canonical URL | Uses canonical URL helper | Keep |
| Logo/image | Uses shared brand asset through absolute URL helper | Keep |
| Email/phone/address | Uses shared contact constants | Keep |
| `sameAs` | Empty array | Keep empty until real profiles are approved |
| ContactPoint | Uses current phone, customer service, English/Bengali, BD | Keep |
| WebSite SearchAction | Uses `/search?q={search_term_string}` | Keep |
| OnlineStore type | Uses `OnlineStore` | Keep |
| Currency/payment | BDT and Cash on Delivery | Keep |
| Area served | Bangladesh country object | Keep |

## Changes Made

- No Organization/WebSite/OnlineStore source fields needed changes.
- Tests were added to confirm these surfaces remain factual and do not include social or payment-provider claims.

## Result

Organization, WebSite, and OnlineStore schema remain factual and bounded to currently supported site identity and Cash on Delivery.
