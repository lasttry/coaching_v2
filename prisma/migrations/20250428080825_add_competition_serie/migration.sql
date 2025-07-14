/*
  Warnings:

  - You are about to drop the column `competition` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `subcomp` on the `games` table. All the data in the column will be lost.
  - Added the required column `competitionId` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "competition",
DROP COLUMN "subcomp",
ADD COLUMN     "competitionId" INTEGER NOT NULL,
ADD COLUMN     "competitionSerieId" INTEGER;

-- CreateTable
CREATE TABLE "CompetitionSerie" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionSerie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_competitionSerieId_fkey" FOREIGN KEY ("competitionSerieId") REFERENCES "CompetitionSerie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionSerie" ADD CONSTRAINT "CompetitionSerie_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
