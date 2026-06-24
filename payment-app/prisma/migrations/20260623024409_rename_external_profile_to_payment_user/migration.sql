/*
  Warnings:

  - You are about to drop the `ExternalProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ExternalProfile";

-- CreateTable
CREATE TABLE "PaymentUser" (
    "id" TEXT NOT NULL,
    "profileNumber" SERIAL NOT NULL,
    "clerkId" TEXT NOT NULL,
    "buyerId" TEXT,
    "buyerName" TEXT,
    "sellerId" TEXT,
    "sellerName" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentUser_profileNumber_key" ON "PaymentUser"("profileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentUser_clerkId_key" ON "PaymentUser"("clerkId");
