-- Add colorHex column with default value
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "colorHex" TEXT NOT NULL DEFAULT '#000000';
