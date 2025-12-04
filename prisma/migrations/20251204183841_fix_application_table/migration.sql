/*
  Warnings:

  - The primary key for the `applications` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."locations" DROP CONSTRAINT "locations_applicationId_fkey";

-- DropIndex
DROP INDEX "public"."locations_applicationId_key";

-- AlterTable
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "applications_id_seq";

-- AlterTable
ALTER TABLE "public"."locations" ALTER COLUMN "applicationId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
