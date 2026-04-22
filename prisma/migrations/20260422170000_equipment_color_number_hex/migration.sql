-- Store the number (foreground) colour separately from the equipment background colour.
ALTER TABLE "EquipmentColor" ADD COLUMN "numberColorHex" VARCHAR(255) NOT NULL DEFAULT '#FFFFFF';
