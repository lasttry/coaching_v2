-- Drop the old unique INDEX (not constraint) on athleteId + number
DROP INDEX IF EXISTS "AthletePreferredNumber_athleteId_number_key";

-- Ensure the correct unique index exists (athleteId + color)
CREATE UNIQUE INDEX IF NOT EXISTS "AthletePreferredNumber_athleteId_color_key" 
ON "AthletePreferredNumber"("athleteId", "color");
