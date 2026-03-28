-- Add speech field to Game
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "speech" TEXT;
