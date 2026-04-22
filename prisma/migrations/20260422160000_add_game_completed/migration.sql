-- Track whether a game has already been played. Automatic by default (date in past),
-- but users can toggle manually. Historical data should therefore be flagged.
ALTER TABLE "Game" ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Game" SET "completed" = true WHERE "date" < NOW();
