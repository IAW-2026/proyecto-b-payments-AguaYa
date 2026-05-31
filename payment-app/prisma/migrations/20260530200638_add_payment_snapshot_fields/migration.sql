/*
  Warnings:

  - Added the required column `buyerEmail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerName` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerName` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "buyerEmail" TEXT NOT NULL,
ADD COLUMN     "buyerName" TEXT NOT NULL,
ADD COLUMN     "sellerName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PaymentItemSnapshot" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productImageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "PaymentItemSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentItemSnapshot" ADD CONSTRAINT "PaymentItemSnapshot_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
