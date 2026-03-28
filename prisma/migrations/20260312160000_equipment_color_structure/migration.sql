-- Step 1: Create EquipmentColor table
CREATE TABLE IF NOT EXISTS "EquipmentColor" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "echelonId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#000000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentColor_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes for EquipmentColor
CREATE INDEX IF NOT EXISTS "EquipmentColor_clubId_idx" ON "EquipmentColor"("clubId");
CREATE INDEX IF NOT EXISTS "EquipmentColor_clubId_seasonId_idx" ON "EquipmentColor"("clubId", "seasonId");
CREATE INDEX IF NOT EXISTS "EquipmentColor_clubId_seasonId_echelonId_idx" ON "EquipmentColor"("clubId", "seasonId", "echelonId");
CREATE UNIQUE INDEX IF NOT EXISTS "EquipmentColor_clubId_seasonId_echelonId_color_key" ON "EquipmentColor"("clubId", "seasonId", "echelonId", "color");

-- Step 3: Add foreign keys to EquipmentColor
ALTER TABLE "EquipmentColor" ADD CONSTRAINT "EquipmentColor_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentColor" ADD CONSTRAINT "EquipmentColor_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EquipmentColor" ADD CONSTRAINT "EquipmentColor_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "Echelon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Migrate existing Equipment data to EquipmentColor
-- Insert distinct color combinations from Equipment into EquipmentColor
INSERT INTO "EquipmentColor" ("clubId", "seasonId", "echelonId", "color", "colorHex", "createdAt", "updatedAt")
SELECT DISTINCT "clubId", "seasonId", "echelonId", "color", "colorHex", NOW(), NOW()
FROM "Equipment"
ON CONFLICT ("clubId", "seasonId", "echelonId", "color") DO NOTHING;

-- Step 5: Add equipmentColorId column to Equipment
ALTER TABLE "Equipment" ADD COLUMN IF NOT EXISTS "equipmentColorId" INTEGER;

-- Step 6: Update Equipment to reference EquipmentColor
UPDATE "Equipment" e
SET "equipmentColorId" = ec.id
FROM "EquipmentColor" ec
WHERE e."clubId" = ec."clubId"
  AND e."seasonId" = ec."seasonId"
  AND e."echelonId" = ec."echelonId"
  AND e."color" = ec."color";

-- Step 7: Make equipmentColorId NOT NULL (only if data was migrated)
-- First check if there are any Equipment records without equipmentColorId
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Equipment" WHERE "equipmentColorId" IS NULL LIMIT 1) THEN
        ALTER TABLE "Equipment" ALTER COLUMN "equipmentColorId" SET NOT NULL;
    END IF;
END $$;

-- Step 8: Add foreign key from Equipment to EquipmentColor
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_equipmentColorId_fkey" FOREIGN KEY ("equipmentColorId") REFERENCES "EquipmentColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Drop old columns from Equipment
ALTER TABLE "Equipment" DROP COLUMN IF EXISTS "clubId";
ALTER TABLE "Equipment" DROP COLUMN IF EXISTS "seasonId";
ALTER TABLE "Equipment" DROP COLUMN IF EXISTS "echelonId";
ALTER TABLE "Equipment" DROP COLUMN IF EXISTS "color";
ALTER TABLE "Equipment" DROP COLUMN IF EXISTS "colorHex";

-- Step 10: Drop old indexes from Equipment
DROP INDEX IF EXISTS "Equipment_clubId_idx";
DROP INDEX IF EXISTS "Equipment_clubId_seasonId_idx";
DROP INDEX IF EXISTS "Equipment_clubId_seasonId_echelonId_idx";

-- Step 11: Create new index for Equipment
CREATE INDEX IF NOT EXISTS "Equipment_equipmentColorId_idx" ON "Equipment"("equipmentColorId");
