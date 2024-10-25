
-- CreateTable
CREATE TABLE "timeEntry" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "entryMinute" INTEGER NOT NULL,
    "entrySecond" INTEGER NOT NULL,
    "exitMinute" INTEGER,
    "exitSecond" INTEGER,

    CONSTRAINT "timeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeEntry_gameId_athleteId_period_idx" ON "timeEntry"("gameId", "athleteId", "period");

-- AddForeignKey
ALTER TABLE "timeEntry" ADD CONSTRAINT "timeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeEntry" ADD CONSTRAINT "timeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
