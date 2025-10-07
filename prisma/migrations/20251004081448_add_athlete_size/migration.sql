-- CreateEnum
CREATE TYPE "AthleteSize" AS ENUM ('S', 'M', 'L', 'XL', 'XXL');

-- AlterTable
ALTER TABLE "Athlete" ADD COLUMN     "size" "AthleteSize";
