/*
  Warnings:

  - You are about to drop the column `defensiveGameId` on the `objectives` table. All the data in the column will be lost.
  - You are about to drop the column `offensiveGameId` on the `objectives` table. All the data in the column will be lost.
  - Added the required column `gameId` to the `objectives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `objectives` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "objectiveType" AS ENUM ('OFFENSIVE', 'DEFENSIVE', 'TEAM', 'INDIVIDUAL');


DELETE FROM "objectives";

-- DropForeignKey
ALTER TABLE "objectives" DROP CONSTRAINT "objectives_defensiveGameId_fkey";

-- DropForeignKey
ALTER TABLE "objectives" DROP CONSTRAINT "objectives_offensiveGameId_fkey";

-- AlterTable
ALTER TABLE "objectives" DROP COLUMN "defensiveGameId",
DROP COLUMN "offensiveGameId",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD COLUMN     "type" "objectiveType" NOT NULL;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
