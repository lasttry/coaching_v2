/*
  Warnings:

  - You are about to drop the `athleteReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `athletes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gameAthletes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `macrocycle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mesocycle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `microcycle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `objectives` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessionGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timeEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."IdType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ObjectiveType" AS ENUM ('OFFENSIVE', 'DEFENSIVE', 'TEAM', 'INDIVIDUAL');

-- DropForeignKey
ALTER TABLE "public"."TeamAthlete" DROP CONSTRAINT "TeamAthlete_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."athleteReport" DROP CONSTRAINT "athleteReport_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."athleteReport" DROP CONSTRAINT "athleteReport_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."athleteReport" DROP CONSTRAINT "athleteReport_reviewedAthleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."athletes" DROP CONSTRAINT "athletes_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gameAthletes" DROP CONSTRAINT "gameAthletes_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."gameAthletes" DROP CONSTRAINT "gameAthletes_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_competitionSerieId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_opponentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_venueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."macrocycle" DROP CONSTRAINT "macrocycle_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mesocycle" DROP CONSTRAINT "mesocycle_macrocycleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."microcycle" DROP CONSTRAINT "microcycle_mesocycleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."objectives" DROP CONSTRAINT "objectives_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessionGoal" DROP CONSTRAINT "sessionGoal_microcycleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."statistic" DROP CONSTRAINT "statistic_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."statistic" DROP CONSTRAINT "statistic_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."timeEntry" DROP CONSTRAINT "timeEntry_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."timeEntry" DROP CONSTRAINT "timeEntry_gameId_fkey";

-- DropTable
DROP TABLE "public"."athleteReport";

-- DropTable
DROP TABLE "public"."athletes";

-- DropTable
DROP TABLE "public"."gameAthletes";

-- DropTable
DROP TABLE "public"."games";

-- DropTable
DROP TABLE "public"."macrocycle";

-- DropTable
DROP TABLE "public"."mesocycle";

-- DropTable
DROP TABLE "public"."microcycle";

-- DropTable
DROP TABLE "public"."objectives";

-- DropTable
DROP TABLE "public"."sessionGoal";

-- DropTable
DROP TABLE "public"."statistic";

-- DropTable
DROP TABLE "public"."timeEntry";

-- DropEnum
DROP TYPE "public"."objectiveType";

-- CreateTable
CREATE TABLE "public"."Athlete" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" VARCHAR(2),
    "name" VARCHAR(50) NOT NULL,
    "birthdate" TIMESTAMP(3),
    "fpbNumber" INTEGER,
    "idNumber" INTEGER,
    "idType" "public"."IdType",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clubId" INTEGER NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameAthlete" (
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "number" TEXT,
    "period1" BOOLEAN,
    "period2" BOOLEAN,
    "period3" BOOLEAN,
    "period4" BOOLEAN,

    CONSTRAINT "GameAthlete_pkey" PRIMARY KEY ("gameId","athleteId")
);

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "away" BOOLEAN NOT NULL,
    "notes" VARCHAR(1000),
    "clubId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "competitionId" INTEGER,
    "competitionSerieId" INTEGER,
    "opponentId" INTEGER NOT NULL,
    "venueId" INTEGER,
    "refereeMain" TEXT,
    "referee1" TEXT,
    "scorer" TEXT,
    "timer" TEXT,
    "shotClock" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Statistic" (
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

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimeEntry" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "entryMinute" INTEGER NOT NULL,
    "entrySecond" INTEGER NOT NULL,
    "exitMinute" INTEGER,
    "exitSecond" INTEGER,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AthleteReport" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "teamObservation" VARCHAR(2000),
    "individualObservation" VARCHAR(2000),
    "timePlayedObservation" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAthleteId" INTEGER,

    CONSTRAINT "AthleteReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Macrocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),
    "number" INTEGER,
    "name" TEXT,
    "clubId" INTEGER NOT NULL,

    CONSTRAINT "Macrocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mesocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),
    "macrocycleId" INTEGER NOT NULL,
    "number" INTEGER,
    "name" TEXT,

    CONSTRAINT "Mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Microcycle" (
    "id" SERIAL NOT NULL,
    "notes" VARCHAR(1000),
    "mesocycleId" INTEGER NOT NULL,
    "number" INTEGER,
    "name" TEXT,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Microcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionGoal" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" VARCHAR(1000),
    "coach" VARCHAR(255) NOT NULL,
    "microcycleId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SessionGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Objective" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" "public"."ObjectiveType" NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Statistic_gameId_athleteId_key" ON "public"."Statistic"("gameId", "athleteId");

-- CreateIndex
CREATE INDEX "TimeEntry_gameId_athleteId_period_idx" ON "public"."TimeEntry"("gameId", "athleteId", "period");

-- CreateIndex
CREATE INDEX "AthleteReport_gameId_athleteId_idx" ON "public"."AthleteReport"("gameId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteReport_gameId_athleteId_key" ON "public"."AthleteReport"("gameId", "athleteId");

-- AddForeignKey
ALTER TABLE "public"."Athlete" ADD CONSTRAINT "Athlete_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameAthlete" ADD CONSTRAINT "GameAthlete_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameAthlete" ADD CONSTRAINT "GameAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_competitionSerieId_fkey" FOREIGN KEY ("competitionSerieId") REFERENCES "public"."CompetitionSerie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "public"."Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Statistic" ADD CONSTRAINT "Statistic_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Statistic" ADD CONSTRAINT "Statistic_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeEntry" ADD CONSTRAINT "TimeEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeEntry" ADD CONSTRAINT "TimeEntry_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AthleteReport" ADD CONSTRAINT "AthleteReport_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AthleteReport" ADD CONSTRAINT "AthleteReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AthleteReport" ADD CONSTRAINT "AthleteReport_reviewedAthleteId_fkey" FOREIGN KEY ("reviewedAthleteId") REFERENCES "public"."Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Macrocycle" ADD CONSTRAINT "Macrocycle_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mesocycle" ADD CONSTRAINT "Mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "public"."Macrocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Microcycle" ADD CONSTRAINT "Microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "public"."Mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionGoal" ADD CONSTRAINT "SessionGoal_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES "public"."Microcycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Objective" ADD CONSTRAINT "Objective_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamAthlete" ADD CONSTRAINT "TeamAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;
