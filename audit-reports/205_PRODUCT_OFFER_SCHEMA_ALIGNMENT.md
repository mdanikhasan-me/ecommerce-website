# Step 205 - Product And Offer Schema Alignment

## Scope

Reviewed `src/backend/seo/structured-data.ts` Product and Offer JSON-LD generation against current product inputs and visible page facts.

## Findings

- Product name, description, image, URL, category, SKU, price, currency, and availability are data-driven.
- Aggregate rating and reviews are gated on actual rating/review inputs.
- Offer seller uses the Boilabin organization name only; it does not claim a seller marketplace.
- No GTIN, MPN, official brand relationship, payment provider, or authenticity guarantee fields were present.
- Header comments contained unsupported "Shopping panels", Amazon/Daraz research, CTR, and trust-signal wording.

## Changes Made

- Rewrote structured-data helper comments so they describe page-aligned schema rather than SEO performance promises.
- Preserved useful data-driven Product and Offer schema.
- Did not add any new Product or Offer fields.

## Tests Added

- Added a Product Offer test that asserts:
  - BDT price/currency remains present;
  - seller remains Boilabin;
  - GTIN and MPN stay absent;
  - authenticity and payment-provider claims stay absent.

## Result

Product and Offer schema remain useful, data-driven, and conservative.
