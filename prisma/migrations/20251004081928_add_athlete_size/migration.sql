/*
  Warnings:

  - You are about to drop the column `size` on the `Athlete` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Athlete" DROP COLUMN "size",
ADD COLUMN     "shirtSize" "AthleteSize";
