/*
  Warnings:

  - Changed the type of `role` on the `AccountClubRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DIRECTOR', 'COACH', 'PLAYER', 'PARENT', 'TEAM_MANAGER');

-- AlterTable
ALTER TABLE "AccountClubRole" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
