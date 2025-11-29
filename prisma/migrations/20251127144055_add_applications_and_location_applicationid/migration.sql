/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `locations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('pending', 'verified', 'approved', 'rejected', 'closed');

-- AlterTable
ALTER TABLE "public"."locations" ADD COLUMN     "applicationId" INTEGER;

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" SERIAL NOT NULL,
    "citizenId" INTEGER NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_citizenId_idx" ON "public"."applications"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "locations_applicationId_key" ON "public"."locations"("applicationId");

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
