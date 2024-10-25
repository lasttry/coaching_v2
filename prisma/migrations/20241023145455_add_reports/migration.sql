/*
  Warnings:

  - You are about to drop the column `submittedById` on the `athleteReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId,athleteId]` on the table `athleteReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewdAthleteId` to the `athleteReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "athleteReport" DROP CONSTRAINT "athleteReport_submittedById_fkey";

-- AlterTable
ALTER TABLE "athleteReport" DROP COLUMN "submittedById",
ADD COLUMN     "reviewdAthleteId" INTEGER NOT NULL,
ALTER COLUMN "teamObservation" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "individualObservation" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "timePlayedObservation" SET DATA TYPE VARCHAR(2000);

-- CreateIndex
CREATE UNIQUE INDEX "athleteReport_gameId_athleteId_key" ON "athleteReport"("gameId", "athleteId");

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_reviewdAthleteId_fkey" FOREIGN KEY ("reviewdAthleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
