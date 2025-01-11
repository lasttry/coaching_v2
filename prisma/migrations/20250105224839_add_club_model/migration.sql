/*
  Warnings:

  - You are about to drop the column `oponentId` on the `games` table. All the data in the column will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clubId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opponentId` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_oponentId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clubId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "games" DROP COLUMN "oponentId",
ADD COLUMN     "opponentId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "teams";

-- CreateTable
CREATE TABLE "Opponent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "shortName" VARCHAR(6) NOT NULL,
    "location" VARCHAR(30) NOT NULL,
    "image" TEXT,

    CONSTRAINT "Opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "shortName" VARCHAR(6),
    "location" VARCHAR(50),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
