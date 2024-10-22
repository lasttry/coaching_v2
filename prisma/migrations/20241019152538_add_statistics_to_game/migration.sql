/*
  Warnings:

  - You are about to drop the `AthleteGameStatistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AthleteGameStatistics" DROP CONSTRAINT "AthleteGameStatistics_athlete_id_fkey";

-- DropForeignKey
ALTER TABLE "AthleteGameStatistics" DROP CONSTRAINT "AthleteGameStatistics_game_id_fkey";

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "teamLostDefRebounds" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "AthleteGameStatistics";

-- CreateTable
CREATE TABLE "statistic" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "freeThrowScored" INTEGER NOT NULL DEFAULT 0,
    "freeThrowMissed" INTEGER NOT NULL DEFAULT 0,
    "fieldGoalScored" INTEGER NOT NULL DEFAULT 0,
    "fieldGoalMissed" INTEGER NOT NULL DEFAULT 0,
    "threePtsScored" INTEGER NOT NULL DEFAULT 0,
    "threePtsMissed" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "defensiveRebounds" INTEGER NOT NULL DEFAULT 0,
    "offensiveRebounds" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "turnovers" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "totalRebounds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "statistic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
