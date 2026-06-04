# Step 237 - Next Implementation Sequence

## Options

| Option | Benefit | Risk | Backend impact | Before UI/UX? | Validation required | Owner approval | Timing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A. Public storefront UI/UX redesign, visual-only | Improves buyer experience and launch polish | High visual regression risk | None if scoped | Can start now | browser screenshots, runtime checks, tests, build | yes | recommended next |
| B. Seed/demo copy cleanup | Reduces remaining scanner findings | Medium DB-adjacent seed risk | seed/demo only | Useful before demo data | scanner/tests/build | yes | soon |
| C. Media derived image variants | Improves performance at scale | Medium/high upload/storage risk | media pipeline | Not required first | image tests/browser/build | yes | later |
| D. Merchant feed implementation readiness | Helps product discovery | High data/account risk | feed/export helpers | After data policy | feed/schema tests | yes | later |
| E. Sitemap scaling/performance | Helps large catalog crawl | Medium DB performance risk | sitemap generation | before large catalog | sitemap tests/build/DB smoke | yes | later |
| F. Product/category buying-guide pages | Adds useful content | Medium owner-fact risk | new content/routes | optional before UI | content audit/build | yes | later |
| G. Footer/mobile footer redesign | Fixes protected visual area | High visual QA risk | frontend visual | part of UI batch or separate | screenshots/build | yes | later |
| H. Search Console/Bing setup after hosting | Enables external verification | account/DNS/provider risk | provider/account | after hosting | manual evidence | yes | after staging |
| I. Staging provider decision package | Moves toward deployment | provider decision risk | docs/env planning | before deploy | docs review | yes | when owner wants hosting |

## Recommended Next Batch

Recommended next: public storefront UI/UX redesign, visual-only, with browser screenshot/runtime validation.

## Why

The content/schema/search verification foundations are now strong enough for a bounded visual pass, provided it does not touch backend behavior or protected product/payment/seller/deployment systems.

## Recommended Next Step

Run a visual-only public storefront UI/UX redesign and QA batch with exact allowed frontend files and screenshot/browser validation.
