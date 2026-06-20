-- Match the three read-heavy storefront feeds so PostgreSQL can filter and
-- order products without an additional sort as the catalog grows.
CREATE INDEX IF NOT EXISTS "Product_isActive_isFeatured_soldCount_idx"
ON "Product"("isActive", "isFeatured", "soldCount");

CREATE INDEX IF NOT EXISTS "Product_isActive_isBestSeller_soldCount_idx"
ON "Product"("isActive", "isBestSeller", "soldCount");

CREATE INDEX IF NOT EXISTS "Product_isActive_isNew_createdAt_idx"
ON "Product"("isActive", "isNew", "createdAt");
