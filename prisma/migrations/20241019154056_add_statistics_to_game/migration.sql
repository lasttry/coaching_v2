/*
  Warnings:

  - A unique constraint covering the columns `[gameId,athleteId]` on the table `statistic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "statistic_gameId_athleteId_key" ON "statistic"("gameId", "athleteId");
