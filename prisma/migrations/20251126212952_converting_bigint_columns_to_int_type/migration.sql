/*
  Warnings:

  - The primary key for the `persons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ci_id_num` on the `persons` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `cf_id_num` on the `relations` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `cf_id_relative` on the `relations` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_num_fkey";

-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_relative_fkey";

-- AlterTable
ALTER TABLE "public"."persons" DROP CONSTRAINT "persons_pkey",
ALTER COLUMN "ci_id_num" SET DATA TYPE INTEGER,
ADD CONSTRAINT "persons_pkey" PRIMARY KEY ("ci_id_num");

-- AlterTable
ALTER TABLE "public"."relations" ALTER COLUMN "cf_id_num" SET DATA TYPE INTEGER,
ALTER COLUMN "cf_id_relative" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_num_fkey" FOREIGN KEY ("cf_id_num") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_relative_fkey" FOREIGN KEY ("cf_id_relative") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;
