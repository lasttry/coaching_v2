-- Drop ALL existing constraints on AthletePreferredNumber to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = '"AthletePreferredNumber"'::regclass AND contype = 'u')
    LOOP
        EXECUTE 'ALTER TABLE "AthletePreferredNumber" DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Ensure only the correct constraint exists (athleteId + color)
ALTER TABLE "AthletePreferredNumber" DROP CONSTRAINT IF EXISTS "AthletePreferredNumber_athleteId_number_key";
ALTER TABLE "AthletePreferredNumber" DROP CONSTRAINT IF EXISTS "AthletePreferredNumber_athleteId_color_key";

-- Recreate the correct unique constraint
ALTER TABLE "AthletePreferredNumber" ADD CONSTRAINT "AthletePreferredNumber_athleteId_color_key" UNIQUE ("athleteId", "color");
