/*
  Warnings:

  - A unique constraint covering the columns `[gameId,athleteId]` on the table `GameEquipment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "GameEquipment_gameId_athleteId_equipmentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "GameEquipment_gameId_athleteId_key" ON "GameEquipment"("gameId", "athleteId");
