/*
  Warnings:

  - You are about to drop the column `date` on the `microcycle` table. All the data in the column will be lost.
  - You are about to drop the column `responsible` on the `microcycle` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `microcycle` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `microcycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `microcycle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "microcycle" DROP COLUMN "date",
DROP COLUMN "responsible",
DROP COLUMN "time",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "sessionGoal" (
    "id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" VARCHAR(1000),
    "coach" VARCHAR(255) NOT NULL,
    "microcycleId" INTEGER NOT NULL,

    CONSTRAINT "sessionGoal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sessionGoal" ADD CONSTRAINT "sessionGoal_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES "microcycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
