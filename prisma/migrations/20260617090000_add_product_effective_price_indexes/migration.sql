-- Store the currently active buyer-facing product price for indexed sorting
-- and filtering. The app keeps this in sync whenever admin product pricing
-- changes.
ALTER TABLE "Product" ADD COLUMN "effectivePrice" DOUBLE PRECISION;

UPDATE "Product"
SET "effectivePrice" = COALESCE("salePrice", "basePrice");

ALTER TABLE "Product" ALTER COLUMN "effectivePrice" SET DEFAULT 0;
ALTER TABLE "Product" ALTER COLUMN "effectivePrice" SET NOT NULL;

CREATE OR REPLACE FUNCTION set_product_effective_price()
RETURNS trigger AS $$
BEGIN
  NEW."effectivePrice" := COALESCE(NEW."salePrice", NEW."basePrice");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Product_set_effectivePrice" ON "Product";
CREATE TRIGGER "Product_set_effectivePrice"
BEFORE INSERT OR UPDATE OF "basePrice", "salePrice" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION set_product_effective_price();

CREATE INDEX IF NOT EXISTS "Product_effectivePrice_idx" ON "Product"("effectivePrice");
CREATE INDEX IF NOT EXISTS "Product_soldCount_idx" ON "Product"("soldCount");
CREATE INDEX IF NOT EXISTS "Product_rating_idx" ON "Product"("rating");

-- Helps contains/ILIKE product search without full sequential scans.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_shortDescription_trgm_idx" ON "Product" USING GIN ("shortDescription" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_description_trgm_idx" ON "Product" USING GIN ("description" gin_trgm_ops);
