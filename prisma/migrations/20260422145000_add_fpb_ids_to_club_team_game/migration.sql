-- Add FPB identifiers so we can import the federation calendar for a team.
ALTER TABLE "Club" ADD COLUMN "fpbClubId" INTEGER;
ALTER TABLE "Team" ADD COLUMN "fpbTeamId" INTEGER;
ALTER TABLE "Game" ADD COLUMN "fpbGameId" INTEGER;

CREATE UNIQUE INDEX "Game_fpbGameId_key" ON "Game"("fpbGameId");
