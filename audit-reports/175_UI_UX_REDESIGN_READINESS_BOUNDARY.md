# Step 175 - UI UX Redesign Readiness Boundary

## Scope

This loop prepared boundaries for future UI/UX redesign without changing visual files.

## Safe UI/UX Areas For A Dedicated Visual Step

- Homepage layout.
- Header/navigation.
- Footer.
- Category page.
- All categories page.
- Product cards.
- Product detail layout.
- Mobile menu.
- Search/filter UI.
- Cart drawer visual polish.
- Trust/help blocks.
- Empty states.
- Typography, spacing, and colors.

## Areas Not To Touch During Visual Work

- Auth/session logic.
- Checkout logic.
- Payment logic.
- Admin permissions.
- Database schema.
- Seller marketplace backend.
- Product visibility rules.
- SEO canonical/noindex behavior unless explicitly scoped.
- API response contracts.
- Order/customer PII boundaries.

## Paused Visual Areas

Footer/newsletter/payment-logo/PromoSection and category media decisions have a long history in the recovery workflow. They should only be changed in a dedicated visual/media step.

## Content Tone Rules For Redesign

- No fake "trusted", "premium", "best", or "leading" copy.
- Use honest utility copy.
- Keep mobile compact.
- Preserve clear payment method display only for methods that are actually available.
- Do not add seller-focused promotion unless seller marketplace is approved.
- Do not imply payment/tracking integrations are live.

## Backend Boundary

Visual redesign should not change product visibility, checkout, auth, payment, seller, report export, tracking, or DB behavior. Components can be rearranged or restyled, but data contracts should stay stable.

## SEO Boundary

Visual redesign should preserve:

- H1 hierarchy;
- canonical URLs;
- noindex rules;
- product/category JSON-LD;
- image alt text;
- crawlable product/category links.

## Recommendation

Run UI/UX redesign only after media and content foundations are safer. A better-looking site with weak image handling and fake copy would still be fragile.
