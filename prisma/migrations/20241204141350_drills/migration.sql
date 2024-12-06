-- CreateTable
CREATE TABLE "Drill" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "svg" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);
