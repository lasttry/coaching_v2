-- CreateTable
CREATE TABLE "AthleteGameStatistics" (
    "id" SERIAL NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "freethrow_scored" INTEGER NOT NULL,
    "freethrow_missed" INTEGER NOT NULL,
    "fieldgoal_scored" INTEGER NOT NULL,
    "fieldgoal_missed" INTEGER NOT NULL,
    "threepts_scored" INTEGER NOT NULL,
    "threepts_missed" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "defensive_rebounds" INTEGER NOT NULL,
    "offensive_rebounds" INTEGER NOT NULL,
    "total_rebounds" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL,
    "steals" INTEGER NOT NULL,
    "turnovers" INTEGER NOT NULL,
    "fouls" INTEGER NOT NULL,
    "team_lost_defensive_rebounds" INTEGER NOT NULL,

    CONSTRAINT "AthleteGameStatistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AthleteGameStatistics" ADD CONSTRAINT "AthleteGameStatistics_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteGameStatistics" ADD CONSTRAINT "AthleteGameStatistics_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
