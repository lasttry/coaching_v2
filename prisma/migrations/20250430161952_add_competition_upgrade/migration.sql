-- AlterTable
ALTER TABLE "games" ADD COLUMN     "teamId" INTEGER,
ALTER COLUMN "competitionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
