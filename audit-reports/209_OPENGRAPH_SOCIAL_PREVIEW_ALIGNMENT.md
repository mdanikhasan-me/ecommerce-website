# Step 209 - OpenGraph Social Preview Alignment

## Scope

Reviewed `src/app/opengraph-image.tsx` static Open Graph image copy.

## Finding

The social image subcopy said:

- authenticity;
- dependable delivery;
- smooth checkout;
- cash on delivery.

Cash on Delivery is supported, but authenticity and smooth checkout are not supported by an approved verification or checkout-quality policy. Delivery reliability language was stronger than visible delivery estimates.

## Change Made

Replaced the subcopy with factual text:

- product listings;
- category browsing;
- cash on delivery information.

No visual layout, colors, dimensions, image generation behavior, or route behavior changed.

## Test/Scanner Result

- The content scanner no longer reports the OpenGraph image authenticity finding.
- Scanner classification now labels `src/app/opengraph-image.tsx` as `opengraph-social-preview`.

## Result

Social preview copy is now calmer and fact-based.
