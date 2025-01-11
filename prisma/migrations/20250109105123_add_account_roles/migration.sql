-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('ADMIN', 'USER', 'VIEWER');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "role" "PlatformRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "TeamType";
