# Step 206 - Shipping, Return, And Payment Schema Alignment

## Scope

Reviewed Product Offer `shippingDetails`, Product Offer `hasMerchantReturnPolicy`, FAQ payment content, shipping page copy, and returns page copy.

## Findings

- Shipping page visibly supports:
  - Tk 60 paid delivery;
  - free delivery threshold over Tk 2,000;
  - Bangladesh zone;
  - delivery estimates that vary by address and conditions.
- FAQ visibly supports:
  - Cash on Delivery is available now;
  - online payment options appear only when available in checkout;
  - seven-day return window for most products.
- Returns page mentioned a return window but did not state the seven-day window.
- Schema previously included exact handling/transit times and `ReturnByMail`; visible policy did not support those exact details.

## Changes Made

- Removed `deliveryTime` from Product Offer `shippingDetails`.
- Removed `returnMethod: ReturnByMail` from Product Offer `hasMerchantReturnPolicy`.
- Kept shipping rate and Bangladesh destination because visible shipping page supports those facts.
- Kept `merchantReturnDays: 7` because the visible FAQ supports the seven-day return window.
- Updated returns page eligibility text to say unused items must be submitted within seven days of delivery.

## Payment Boundary

- Kept Cash on Delivery as the only OnlineStore payment method in schema.
- Did not add bKash, Nagad, Visa, Mastercard, or other online payment provider claims.

## Tests Added

- Added tests that assert:
  - shipping rate and destination remain present;
  - exact delivery timing stays absent;
  - seven-day return window remains present;
  - return method stays absent;
  - payment providers stay absent.

## Result

Shipping, return, and payment schema now matches visible facts more closely without weakening useful schema.
