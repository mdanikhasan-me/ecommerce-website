-- Target the read-heavy parent-child paths used by storefront product cards,
-- product details, account orders, reviews, banners, and category navigation.
CREATE INDEX IF NOT EXISTS "Account_userId_idx"
ON "Account"("userId");

CREATE INDEX IF NOT EXISTS "Session_userId_idx"
ON "Session"("userId");

CREATE INDEX IF NOT EXISTS "Category_isActive_parentId_sortOrder_idx"
ON "Category"("isActive", "parentId", "sortOrder");

CREATE INDEX IF NOT EXISTS "ProductImage_productId_sortOrder_isPrimary_idx"
ON "ProductImage"("productId", "sortOrder", "isPrimary");

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_isActive_sortOrder_idx"
ON "ProductVariant"("productId", "isActive", "sortOrder");

CREATE INDEX IF NOT EXISTS "VariantOption_variantId_idx"
ON "VariantOption"("variantId");

CREATE INDEX IF NOT EXISTS "ProductAttribute_productId_sortOrder_idx"
ON "ProductAttribute"("productId", "sortOrder");

CREATE INDEX IF NOT EXISTS "ProductSpec_productId_sortOrder_idx"
ON "ProductSpec"("productId", "sortOrder");

CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx"
ON "Order"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx"
ON "Order"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx"
ON "OrderItem"("orderId");

CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx"
ON "OrderItem"("productId");

CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_createdAt_idx"
ON "OrderStatusHistory"("orderId", "createdAt");

CREATE INDEX IF NOT EXISTS "Review_productId_status_createdAt_idx"
ON "Review"("productId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "Review_userId_productId_idx"
ON "Review"("userId", "productId");

CREATE INDEX IF NOT EXISTS "Banner_isActive_position_sortOrder_idx"
ON "Banner"("isActive", "position", "sortOrder");

DROP INDEX IF EXISTS "ProductVariant_productId_idx";
DROP INDEX IF EXISTS "Order_userId_idx";
DROP INDEX IF EXISTS "Order_status_idx";
DROP INDEX IF EXISTS "Review_productId_idx";
