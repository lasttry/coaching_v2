/*
  Warnings:

  - You are about to drop the column `fbpTeamId` on the `Opponent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Opponent" DROP COLUMN "fbpTeamId",
ADD COLUMN     "fpbTeamId" INTEGER;
