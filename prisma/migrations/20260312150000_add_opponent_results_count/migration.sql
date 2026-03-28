-- Add opponentResultsCount field to Game with default value 5
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "opponentResultsCount" INTEGER NOT NULL DEFAULT 5;
