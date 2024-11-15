/*
  Warnings:

  - You are about to drop the column `reviewdAthleteId` on the `athleteReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "athleteReport" DROP CONSTRAINT "athleteReport_reviewdAthleteId_fkey";

-- AlterTable
ALTER TABLE "athleteReport" DROP COLUMN "reviewdAthleteId",
ADD COLUMN     "reviewedAthleteId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_reviewedAthleteId_fkey" FOREIGN KEY ("reviewedAthleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
