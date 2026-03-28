/*
  Warnings:

  - A unique constraint covering the columns `[clubId,seasonId,echelonId,number,size]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `echelonId` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Equipment_clubId_seasonId_number_size_key";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "echelonId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Equipment_clubId_seasonId_echelonId_idx" ON "Equipment"("clubId", "seasonId", "echelonId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_clubId_seasonId_echelonId_number_size_key" ON "Equipment"("clubId", "seasonId", "echelonId", "number", "size");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "Echelon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
