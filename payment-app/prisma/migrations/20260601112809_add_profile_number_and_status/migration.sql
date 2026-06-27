/*
  Warnings:

  - A unique constraint covering the columns `[profileNumber]` on the table `ExternalProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "ExternalProfile" ADD COLUMN     "profileNumber" SERIAL NOT NULL,
ADD COLUMN     "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExternalProfile_profileNumber_key" ON "ExternalProfile"("profileNumber");
