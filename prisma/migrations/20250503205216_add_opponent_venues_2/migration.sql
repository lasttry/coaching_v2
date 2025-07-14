-- AlterTable
ALTER TABLE "games" ADD COLUMN     "venueId" INTEGER;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
