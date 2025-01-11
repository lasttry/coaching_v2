/*
  Warnings:

  - You are about to drop the column `clubId` on the `Account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_clubId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "clubId";

-- CreateTable
CREATE TABLE "AccountClub" (
    "accountId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountClub_pkey" PRIMARY KEY ("accountId","clubId")
);

-- AddForeignKey
ALTER TABLE "AccountClub" ADD CONSTRAINT "AccountClub_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountClub" ADD CONSTRAINT "AccountClub_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
