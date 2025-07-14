-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "opponentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
