/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PaymentAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentAdmin_userId_key" ON "PaymentAdmin"("userId");
