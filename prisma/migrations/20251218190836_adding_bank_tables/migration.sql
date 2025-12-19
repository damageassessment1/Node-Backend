/*
  Warnings:

  - The values [pending,verified,approved,rejected,closed] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [alive,dead] on the enum `CitizenStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [male,female] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [before_war,after_war,temporary,current] on the enum `LocationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [single,married,divorced,widowed] on the enum `MaritalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,supervisor] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,national_id_verified,questions_verified,verified] on the enum `VerificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `application_date` on the `applications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('SAVINGS', 'CURRENT', 'WALLET');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."LocationStatus" AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ApplicationStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED', 'CLOSED');
ALTER TABLE "public"."applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."applications" ALTER COLUMN "status" TYPE "public"."ApplicationStatus_new" USING ("status"::text::"public"."ApplicationStatus_new");
ALTER TYPE "public"."ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "public"."ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "public"."applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CitizenStatus_new" AS ENUM ('ALIVE', 'DEAD');
ALTER TABLE "public"."citizens" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."citizens" ALTER COLUMN "status" TYPE "public"."CitizenStatus_new" USING ("status"::text::"public"."CitizenStatus_new");
ALTER TYPE "public"."CitizenStatus" RENAME TO "CitizenStatus_old";
ALTER TYPE "public"."CitizenStatus_new" RENAME TO "CitizenStatus";
DROP TYPE "public"."CitizenStatus_old";
ALTER TABLE "public"."citizens" ALTER COLUMN "status" SET DEFAULT 'ALIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Gender_new" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "public"."citizens" ALTER COLUMN "gender" TYPE "public"."Gender_new" USING ("gender"::text::"public"."Gender_new");
ALTER TYPE "public"."Gender" RENAME TO "Gender_old";
ALTER TYPE "public"."Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."LocationType_new" AS ENUM ('BEFORE_WAR', 'AFTER_WAR', 'TEMPORARY', 'CURRENT');
ALTER TABLE "public"."locations" ALTER COLUMN "type" TYPE "public"."LocationType_new" USING ("type"::text::"public"."LocationType_new");
ALTER TYPE "public"."LocationType" RENAME TO "LocationType_old";
ALTER TYPE "public"."LocationType_new" RENAME TO "LocationType";
DROP TYPE "public"."LocationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MaritalStatus_new" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');
ALTER TABLE "public"."citizens" ALTER COLUMN "marital_status" TYPE "public"."MaritalStatus_new" USING ("marital_status"::text::"public"."MaritalStatus_new");
ALTER TYPE "public"."MaritalStatus" RENAME TO "MaritalStatus_old";
ALTER TYPE "public"."MaritalStatus_new" RENAME TO "MaritalStatus";
DROP TYPE "public"."MaritalStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'SUPERVISOR');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerificationStatus_new" AS ENUM ('PENDING', 'NATIONAL_ID_VERIFIED', 'QUESTIONS_VERIFIED', 'VERIFIED');
ALTER TABLE "public"."citizens" ALTER COLUMN "verification_status" DROP DEFAULT;
ALTER TABLE "public"."citizens" ALTER COLUMN "verification_status" TYPE "public"."VerificationStatus_new" USING ("verification_status"::text::"public"."VerificationStatus_new");
ALTER TYPE "public"."VerificationStatus" RENAME TO "VerificationStatus_old";
ALTER TYPE "public"."VerificationStatus_new" RENAME TO "VerificationStatus";
DROP TYPE "public"."VerificationStatus_old";
ALTER TABLE "public"."citizens" ALTER COLUMN "verification_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."applications" DROP COLUMN "application_date",
ADD COLUMN     "type" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."citizens" ALTER COLUMN "status" SET DEFAULT 'ALIVE',
ALTER COLUMN "verification_status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."locations" ADD COLUMN     "status" "public"."LocationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "public"."banks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "swiftCode" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."citizen_bank_account" (
    "id" TEXT NOT NULL,
    "citizenId" INTEGER NOT NULL,
    "bankId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "iban" TEXT,
    "accountType" "public"."AccountType" NOT NULL,
    "currency" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "citizen_bank_account_citizenId_idx" ON "public"."citizen_bank_account"("citizenId");

-- CreateIndex
CREATE INDEX "citizen_bank_account_bankId_idx" ON "public"."citizen_bank_account"("bankId");

-- AddForeignKey
ALTER TABLE "public"."citizen_bank_account" ADD CONSTRAINT "citizen_bank_account_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citizen_bank_account" ADD CONSTRAINT "citizen_bank_account_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "public"."banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
