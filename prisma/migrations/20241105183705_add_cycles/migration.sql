-- CreateTable
CREATE TABLE "macrocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),

    CONSTRAINT "macrocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesocycle" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" VARCHAR(1000),
    "macrocycleId" INTEGER NOT NULL,

    CONSTRAINT "mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcycle" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "responsible" VARCHAR(100) NOT NULL,
    "time" VARCHAR(50) NOT NULL,
    "notes" VARCHAR(1000),
    "mesocycleId" INTEGER NOT NULL,

    CONSTRAINT "microcycle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mesocycle" ADD CONSTRAINT "mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "macrocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcycle" ADD CONSTRAINT "microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
