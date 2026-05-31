-- CreateTable
CREATE TABLE "ExternalProfile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "buyerId" TEXT,
    "sellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalProfile_clerkId_key" ON "ExternalProfile"("clerkId");
