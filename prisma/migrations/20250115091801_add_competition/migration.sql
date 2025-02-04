-- CreateTable
CREATE TABLE "Competition" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "image" TEXT,
    "echelonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_echelonId_fkey" FOREIGN KEY ("echelonId") REFERENCES "Echelon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
