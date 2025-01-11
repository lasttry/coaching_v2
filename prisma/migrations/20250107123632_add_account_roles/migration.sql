/*
  Warnings:

  - The primary key for the `AccountClub` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[accountId,clubId]` on the table `AccountClub` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccountClub" DROP CONSTRAINT "AccountClub_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AccountClub_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "AccountClubRole" (
    "id" SERIAL NOT NULL,
    "accountClubId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "AccountClubRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountClub_accountId_clubId_key" ON "AccountClub"("accountId", "clubId");

-- AddForeignKey
ALTER TABLE "AccountClubRole" ADD CONSTRAINT "AccountClubRole_accountClubId_fkey" FOREIGN KEY ("accountClubId") REFERENCES "AccountClub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
