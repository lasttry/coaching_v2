-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameEquipment" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,

    CONSTRAINT "GameEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipment_clubId_idx" ON "Equipment"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "GameEquipment_gameId_athleteId_equipmentId_key" ON "GameEquipment"("gameId", "athleteId", "equipmentId");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEquipment" ADD CONSTRAINT "GameEquipment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEquipment" ADD CONSTRAINT "GameEquipment_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEquipment" ADD CONSTRAINT "GameEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
