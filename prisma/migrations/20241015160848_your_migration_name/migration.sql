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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "gameAthletes" ADD CONSTRAINT "gameAthletes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gameAthletes" ADD CONSTRAINT "gameAthletes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_oponentId_fkey" FOREIGN KEY ("oponentId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
