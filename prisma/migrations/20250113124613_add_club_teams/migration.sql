-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('A', 'B', 'C');

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" "TeamType",
    "clubId" INTEGER NOT NULL,
    "echelonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAthlete" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,

    CONSTRAINT "TeamAthlete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamAthlete_teamId_athleteId_key" ON "TeamAthlete"("teamId", "athleteId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "Echelon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAthlete" ADD CONSTRAINT "TeamAthlete_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAthlete" ADD CONSTRAINT "TeamAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
