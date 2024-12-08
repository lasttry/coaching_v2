-- CreateEnum
CREATE TYPE "objectiveType" AS ENUM ('OFFENSIVE', 'DEFENSIVE', 'TEAM', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "athletes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "birthdate" TIMESTAMP(3),
    "fpbNumber" INTEGER,
    "idNumber" INTEGER,
    "idType" VARCHAR(50),
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gameAthletes" (
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "number" TEXT,
    "period1" BOOLEAN,
    "period2" BOOLEAN,
    "period3" BOOLEAN,
    "period4" BOOLEAN,

    CONSTRAINT "gameAthletes_pkey" PRIMARY KEY ("gameId","athleteId")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "away" BOOLEAN NOT NULL,
    "competition" VARCHAR(30),
    "subcomp" VARCHAR(30),
    "oponentId" INTEGER NOT NULL,
    "notes" VARCHAR(1000),
    "teamLostDefRebounds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL,
    "teamName" VARCHAR(50) NOT NULL,
    "shortName" VARCHAR(6),
    "season" VARCHAR(10),
    "homeLocation" VARCHAR(30),
    "image" TEXT,
    "backgroundColor" VARCHAR(7),
    "foregroundColor" VARCHAR(7),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "shortName" VARCHAR(6) NOT NULL,
    "location" VARCHAR(30) NOT NULL,
    "image" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistic" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "freeThrowScored" INTEGER NOT NULL DEFAULT 0,
    "freeThrowMissed" INTEGER NOT NULL DEFAULT 0,
    "fieldGoalScored" INTEGER NOT NULL DEFAULT 0,
    "fieldGoalMissed" INTEGER NOT NULL DEFAULT 0,
    "threePtsScored" INTEGER NOT NULL DEFAULT 0,
    "threePtsMissed" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "defensiveRebounds" INTEGER NOT NULL DEFAULT 0,
    "offensiveRebounds" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "turnovers" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "totalRebounds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "statistic_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "athleteReport" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "teamObservation" VARCHAR(2000),
    "individualObservation" VARCHAR(2000),
    "timePlayedObservation" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAthleteId" INTEGER,

    CONSTRAINT "athleteReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macrocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),
    "number" INTEGER,
    "name" TEXT,

    CONSTRAINT "macrocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),
    "macrocycleId" INTEGER NOT NULL,
    "number" INTEGER,
    "name" TEXT,

    CONSTRAINT "mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcycle" (
    "id" SERIAL NOT NULL,
    "notes" VARCHAR(1000),
    "mesocycleId" INTEGER NOT NULL,
    "number" INTEGER,
    "name" TEXT,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "microcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessionGoal" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" VARCHAR(1000),
    "coach" VARCHAR(255) NOT NULL,
    "microcycleId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "sessionGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" "objectiveType" NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drill" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "svg" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "statistic_gameId_athleteId_key" ON "statistic"("gameId", "athleteId");

-- CreateIndex
CREATE INDEX "timeEntry_gameId_athleteId_period_idx" ON "timeEntry"("gameId", "athleteId", "period");

-- CreateIndex
CREATE INDEX "athleteReport_gameId_athleteId_idx" ON "athleteReport"("gameId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "athleteReport_gameId_athleteId_key" ON "athleteReport"("gameId", "athleteId");

-- AddForeignKey
ALTER TABLE "gameAthletes" ADD CONSTRAINT "gameAthletes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameAthletes" ADD CONSTRAINT "gameAthletes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_oponentId_fkey" FOREIGN KEY ("oponentId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeEntry" ADD CONSTRAINT "timeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeEntry" ADD CONSTRAINT "timeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athleteReport" ADD CONSTRAINT "athleteReport_reviewedAthleteId_fkey" FOREIGN KEY ("reviewedAthleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesocycle" ADD CONSTRAINT "mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "macrocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcycle" ADD CONSTRAINT "microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessionGoal" ADD CONSTRAINT "sessionGoal_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES "microcycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
