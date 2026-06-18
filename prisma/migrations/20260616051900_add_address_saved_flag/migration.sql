-- Distinguish reusable account addresses from order-only delivery snapshots.
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "isSaved" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "Address_userId_isSaved_idx" ON "Address"("userId", "isSaved");
