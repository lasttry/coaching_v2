/*
  Warnings:

  - Added the required column `clubId` to the `athletes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clubId` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clubId` to the `macrocycle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "athletes" ADD COLUMN     "clubId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "clubId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "macrocycle" ADD COLUMN     "clubId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macrocycle" ADD CONSTRAINT "macrocycle_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
