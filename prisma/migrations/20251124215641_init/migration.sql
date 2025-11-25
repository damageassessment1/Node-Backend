-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed');

-- CreateEnum
CREATE TYPE "public"."CitizenStatus" AS ENUM ('alive', 'dead');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('before_war', 'after_war', 'temporary', 'current');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'supervisor');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'admin',
    "remember_token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."citizens" (
    "id" SERIAL NOT NULL,
    "national_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "father_name" TEXT,
    "grandfather_name" TEXT,
    "family_name" TEXT NOT NULL,
    "full_name" TEXT,
    "mother_name" TEXT,
    "place_of_birth" TEXT,
    "country" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "public"."Gender",
    "marital_status" "public"."MaritalStatus",
    "status" "public"."CitizenStatus" NOT NULL DEFAULT 'alive',
    "password" TEXT NOT NULL,
    "extra_data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" SERIAL NOT NULL,
    "citizenId" INTEGER NOT NULL,
    "type" "public"."LocationType" NOT NULL,
    "governorate" TEXT,
    "town" TEXT,
    "street" TEXT,
    "block_number" TEXT,
    "house_number" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_national_id_key" ON "public"."citizens"("national_id");

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
