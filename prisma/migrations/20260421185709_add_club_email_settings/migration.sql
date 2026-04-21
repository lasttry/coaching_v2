-- CreateTable
CREATE TABLE "ClubEmailSettings" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "host" VARCHAR(255),
    "port" INTEGER,
    "secure" BOOLEAN NOT NULL DEFAULT true,
    "user" VARCHAR(255),
    "passEncrypted" TEXT,
    "fromEmail" VARCHAR(255),
    "fromName" VARCHAR(100),
    "replyTo" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubEmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubEmailSettings_clubId_key" ON "ClubEmailSettings"("clubId");

-- AddForeignKey
ALTER TABLE "ClubEmailSettings" ADD CONSTRAINT "ClubEmailSettings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
