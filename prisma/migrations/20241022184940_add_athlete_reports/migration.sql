-- CreateTable
CREATE TABLE "athleteReport" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "submittedById" INTEGER NOT NULL,
    "teamObservation" VARCHAR(1000),
    "individualObservation" VARCHAR(1000),
    "timePlayedObservation" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athleteReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "athleteReport_gameId_athleteId_idx" ON "athleteReport"("gameId", "athleteId");

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
