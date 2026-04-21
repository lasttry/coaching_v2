-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('INFO', 'ATTENTION', 'IMPORTANT', 'PRIORITY');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('ATHLETE_BIRTHDAY');

-- CreateEnum
CREATE TYPE "AlertRecipientStatus" AS ENUM ('UNREAD', 'READ', 'DELETED');

-- AlterTable
ALTER TABLE "EquipmentColor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "accountId" INTEGER;

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "type" "AlertType" NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" VARCHAR(500),
    "referenceType" VARCHAR(50),
    "referenceId" INTEGER,
    "triggerDate" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRecipient" (
    "id" SERIAL NOT NULL,
    "alertId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "status" "AlertRecipientStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_clubId_idx" ON "Alert"("clubId");

-- CreateIndex
CREATE INDEX "Alert_triggerDate_idx" ON "Alert"("triggerDate");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_clubId_category_referenceType_referenceId_triggerDate_key" ON "Alert"("clubId", "category", "referenceType", "referenceId", "triggerDate");

-- CreateIndex
CREATE INDEX "AlertRecipient_accountId_status_idx" ON "AlertRecipient"("accountId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AlertRecipient_alertId_accountId_key" ON "AlertRecipient"("alertId", "accountId");

-- CreateIndex
CREATE INDEX "Staff_accountId_idx" ON "Staff"("accountId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRecipient" ADD CONSTRAINT "AlertRecipient_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
