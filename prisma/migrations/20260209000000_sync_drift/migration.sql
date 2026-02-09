-- Migration to sync database drift
-- These columns were added via prisma db push and need to be tracked in migration history

-- Add isBestSeller column to Product table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isBestSeller" BOOLEAN NOT NULL DEFAULT false;

-- Add logoUrl column to SiteSettings table
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
