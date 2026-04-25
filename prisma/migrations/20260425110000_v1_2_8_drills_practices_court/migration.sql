-- CreateEnum
CREATE TYPE "AttendanceDefault" AS ENUM ('ALL', 'NONE');

-- CreateEnum
CREATE TYPE "PracticeItemType" AS ENUM ('FREETEXT', 'DRILL', 'PLAY', 'BREAKDOWN', 'MY_DRILL');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "drillRecentColors" JSONB;

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "courtBackground" VARCHAR(16),
ADD COLUMN     "courtCenterColor" VARCHAR(7),
ADD COLUMN     "courtKeyColor" VARCHAR(7),
ADD COLUMN     "courtLineColor" VARCHAR(7),
ADD COLUMN     "courtLogoRotation" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "courtMarginColor" VARCHAR(7),
ADD COLUMN     "courtShowLogo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Drill" ADD COLUMN     "accountId" INTEGER,
ADD COLUMN     "ballsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "basketsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clubId" INTEGER,
ADD COLUMN     "coachesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "conesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defaultText" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "echelonId" INTEGER,
ADD COLUMN     "extraEquipment" VARCHAR(255),
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "playersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "posCenter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "posForward" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "posGuard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tips" TEXT,
ADD COLUMN     "title" VARCHAR(255),
ADD COLUMN     "typeFundamental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "typeIndividual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "typeTeam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "variations" TEXT,
ALTER COLUMN "svg" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EquipmentColor" ALTER COLUMN "numberColorHex" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Macrocycle" ADD COLUMN     "teamId" INTEGER;

-- CreateTable
CREATE TABLE "DrillGraphic" (
    "id" SERIAL NOT NULL,
    "drillId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "svg" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrillGraphic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillTopic" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "key" VARCHAR(80),
    "name" VARCHAR(120) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DrillTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillTopicLink" (
    "drillId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "DrillTopicLink_pkey" PRIMARY KEY ("drillId","topicId")
);

-- CreateTable
CREATE TABLE "Practice" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clubId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "subtitle" VARCHAR(255),
    "topic" VARCHAR(255) NOT NULL,
    "offensiveGoals" VARCHAR(500),
    "defensiveGoals" VARCHAR(500),
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "groups" JSONB,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeItem" (
    "id" SERIAL NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "type" "PracticeItemType" NOT NULL DEFAULT 'FREETEXT',
    "title" VARCHAR(255),
    "text" TEXT,
    "drillId" INTEGER,
    "graphics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeAthlete" (
    "id" SERIAL NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "attending" BOOLEAN NOT NULL DEFAULT true,
    "attended" BOOLEAN,
    "lateMinutes" INTEGER,
    "absenceReasonId" INTEGER,
    "absenceNotes" TEXT,

    CONSTRAINT "PracticeAthlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubAttendanceReason" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "key" VARCHAR(40),
    "name" VARCHAR(120) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClubAttendanceReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPracticeSettings" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "defaultAttendanceMale" "AttendanceDefault" NOT NULL DEFAULT 'ALL',
    "defaultAttendanceFemale" "AttendanceDefault" NOT NULL DEFAULT 'ALL',
    "defaultAttendanceCoed" "AttendanceDefault" NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubPracticeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrillGraphic_drillId_order_idx" ON "DrillGraphic"("drillId", "order");

-- CreateIndex
CREATE INDEX "DrillTopic_clubId_order_idx" ON "DrillTopic"("clubId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "DrillTopic_clubId_key_key" ON "DrillTopic"("clubId", "key");

-- CreateIndex
CREATE INDEX "DrillTopicLink_topicId_idx" ON "DrillTopicLink"("topicId");

-- CreateIndex
CREATE INDEX "Practice_clubId_date_idx" ON "Practice"("clubId", "date");

-- CreateIndex
CREATE INDEX "Practice_teamId_date_idx" ON "Practice"("teamId", "date");

-- CreateIndex
CREATE INDEX "PracticeItem_practiceId_order_idx" ON "PracticeItem"("practiceId", "order");

-- CreateIndex
CREATE INDEX "PracticeAthlete_practiceId_idx" ON "PracticeAthlete"("practiceId");

-- CreateIndex
CREATE INDEX "PracticeAthlete_athleteId_idx" ON "PracticeAthlete"("athleteId");

-- CreateIndex
CREATE INDEX "PracticeAthlete_absenceReasonId_idx" ON "PracticeAthlete"("absenceReasonId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeAthlete_practiceId_athleteId_key" ON "PracticeAthlete"("practiceId", "athleteId");

-- CreateIndex
CREATE INDEX "ClubAttendanceReason_clubId_order_idx" ON "ClubAttendanceReason"("clubId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ClubAttendanceReason_clubId_key_key" ON "ClubAttendanceReason"("clubId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ClubPracticeSettings_clubId_key" ON "ClubPracticeSettings"("clubId");

-- CreateIndex
CREATE INDEX "Drill_clubId_idx" ON "Drill"("clubId");

-- AddForeignKey
ALTER TABLE "Macrocycle" ADD CONSTRAINT "Macrocycle_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drill" ADD CONSTRAINT "Drill_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drill" ADD CONSTRAINT "Drill_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drill" ADD CONSTRAINT "Drill_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "Echelon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillGraphic" ADD CONSTRAINT "DrillGraphic_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillTopic" ADD CONSTRAINT "DrillTopic_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillTopicLink" ADD CONSTRAINT "DrillTopicLink_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillTopicLink" ADD CONSTRAINT "DrillTopicLink_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DrillTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeItem" ADD CONSTRAINT "PracticeItem_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeItem" ADD CONSTRAINT "PracticeItem_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAthlete" ADD CONSTRAINT "PracticeAthlete_absenceReasonId_fkey" FOREIGN KEY ("absenceReasonId") REFERENCES "ClubAttendanceReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAthlete" ADD CONSTRAINT "PracticeAthlete_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAthlete" ADD CONSTRAINT "PracticeAthlete_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubAttendanceReason" ADD CONSTRAINT "ClubAttendanceReason_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPracticeSettings" ADD CONSTRAINT "ClubPracticeSettings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

