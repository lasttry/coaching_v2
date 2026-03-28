-- Delete existing preferred numbers as the structure is changing
-- (from number+preference order to number per equipment color)
DELETE FROM "AthletePreferredNumber";

-- Drop the old unique constraint
ALTER TABLE "AthletePreferredNumber" DROP CONSTRAINT IF EXISTS "AthletePreferredNumber_athleteId_number_key";

-- Drop the preference column
ALTER TABLE "AthletePreferredNumber" DROP COLUMN IF EXISTS "preference";

-- Add the color column
ALTER TABLE "AthletePreferredNumber" ADD COLUMN "color" TEXT NOT NULL;

-- Create the new unique constraint (one number per color per athlete)
ALTER TABLE "AthletePreferredNumber" ADD CONSTRAINT "AthletePreferredNumber_athleteId_color_key" UNIQUE ("athleteId", "color");
