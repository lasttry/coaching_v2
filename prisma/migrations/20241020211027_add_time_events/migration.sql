-- CreateEnum
CREATE TYPE "TimeEventType" AS ENUM ('ENTRY', 'EXIT');

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "second" INTEGER NOT NULL,
    "eventType" "TimeEventType" NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeEntry_gameId_athleteId_idx" ON "TimeEntry"("gameId", "athleteId");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
