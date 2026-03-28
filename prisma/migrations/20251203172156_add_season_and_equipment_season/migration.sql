/*
  Warnings:

  - You are about to drop the column `season` on the `Club` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clubId,seasonId,number,size]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seasonId` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "season";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "seasonId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE INDEX "Equipment_clubId_seasonId_idx" ON "Equipment"("clubId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_clubId_seasonId_number_size_key" ON "Equipment"("clubId", "seasonId", "number", "size");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
