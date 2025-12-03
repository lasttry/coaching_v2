-- CreateTable
CREATE TABLE "AthletePreferredNumber" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "preference" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AthletePreferredNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AthletePreferredNumber_athleteId_number_key" ON "AthletePreferredNumber"("athleteId", "number");

-- AddForeignKey
ALTER TABLE "AthletePreferredNumber" ADD CONSTRAINT "AthletePreferredNumber_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
