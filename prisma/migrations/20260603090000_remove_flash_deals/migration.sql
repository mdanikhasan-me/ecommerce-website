-- Remove the active Flash Deals feature from the local/pre-launch schema.
-- This preserves historical migration records while dropping the current tables.

DELETE FROM "Banner"
WHERE "title" = 'Flash Sale'
  AND "linkUrl" = '/deals'
  AND "position" = 'promo';

DROP TABLE IF EXISTS "FlashSaleItem";

DROP TABLE IF EXISTS "FlashSale";
