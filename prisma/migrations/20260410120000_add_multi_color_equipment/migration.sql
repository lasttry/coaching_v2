-- AlterTable
ALTER TABLE "GameEquipment" ADD COLUMN "equipmentColorId" INTEGER;
ALTER TABLE "GameEquipment" ADD COLUMN "manualOverride" BOOLEAN NOT NULL DEFAULT false;

-- Populate equipmentColorId from equipment
UPDATE "GameEquipment" ge
SET "equipmentColorId" = e."equipmentColorId"
FROM "Equipment" e
WHERE ge."equipmentId" = e."id";

-- Make equipmentColorId required after population
ALTER TABLE "GameEquipment" ALTER COLUMN "equipmentColorId" SET NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "GameEquipment_gameId_athleteId_key";

-- CreateIndex
CREATE UNIQUE INDEX "GameEquipment_gameId_athleteId_equipmentColorId_key" ON "GameEquipment"("gameId", "athleteId", "equipmentColorId");

-- CreateIndex
CREATE INDEX "GameEquipment_gameId_idx" ON "GameEquipment"("gameId");

-- CreateIndex
CREATE INDEX "GameEquipment_athleteId_idx" ON "GameEquipment"("athleteId");

-- CreateIndex
CREATE INDEX "GameEquipment_equipmentColorId_idx" ON "GameEquipment"("equipmentColorId");

-- AddForeignKey
ALTER TABLE "GameEquipment" ADD CONSTRAINT "GameEquipment_equipmentColorId_fkey" FOREIGN KEY ("equipmentColorId") REFERENCES "EquipmentColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
