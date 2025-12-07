/*
  Warnings:

  - A unique constraint covering the columns `[citizenId]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "applications_citizenId_key" ON "public"."applications"("citizenId");
