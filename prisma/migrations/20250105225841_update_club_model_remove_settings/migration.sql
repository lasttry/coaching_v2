/*
  Warnings:

  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "backgroundColor" VARCHAR(7),
ADD COLUMN     "foregroundColor" VARCHAR(7),
ADD COLUMN     "homeLocation" VARCHAR(30),
ADD COLUMN     "season" VARCHAR(10);

-- DropTable
DROP TABLE "settings";
