-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('pending', 'national_id_verified', 'questions_verified', 'verified');

-- AlterTable
ALTER TABLE "public"."citizens" ADD COLUMN     "verification_status" "public"."VerificationStatus" NOT NULL DEFAULT 'pending';
