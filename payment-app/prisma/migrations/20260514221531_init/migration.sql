-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'cancelled', 'approved', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mpPaymentId" TEXT,
    "mpStatus" TEXT,
    "mpPaymentMethod" TEXT,
    "mpPaymentDate" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAdmin" (
    "userId" TEXT NOT NULL,
    "paymentAdminId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAdmin_pkey" PRIMARY KEY ("paymentAdminId")
);
