/*
  Warnings:

  - The `shirtSize` column on the `Athlete` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `size` on the `Equipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Size" AS ENUM ('S', 'M', 'L', 'XL', 'XXL');

-- AlterTable
ALTER TABLE "Athlete" DROP COLUMN "shirtSize",
ADD COLUMN     "shirtSize" "Size";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "size",
ADD COLUMN     "size" "Size" NOT NULL;

-- DropEnum
DROP TYPE "AthleteSize";
