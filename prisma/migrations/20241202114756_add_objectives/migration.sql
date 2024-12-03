/*
  Warnings:

  - You are about to drop the `defensiveObjective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `offensiveObjective` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "defensiveObjective" DROP CONSTRAINT "defensiveObjective_gameId_fkey";

-- DropForeignKey
ALTER TABLE "offensiveObjective" DROP CONSTRAINT "offensiveObjective_gameId_fkey";

-- DropTable
DROP TABLE "defensiveObjective";

-- DropTable
DROP TABLE "offensiveObjective";

-- CreateTable
CREATE TABLE "objectives" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "offensiveGameId" INTEGER NOT NULL,
    "defensiveGameId" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_defensiveGameId_fkey" FOREIGN KEY ("defensiveGameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_offensiveGameId_fkey" FOREIGN KEY ("offensiveGameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
