ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "titleStyle" TEXT NOT NULL DEFAULT 'modern';
ALTER TABLE "Banner" ALTER COLUMN "buttonStyle" SET DEFAULT 'obsidian';
ALTER TABLE "Banner" ALTER COLUMN "textTone" SET DEFAULT 'starlight';
