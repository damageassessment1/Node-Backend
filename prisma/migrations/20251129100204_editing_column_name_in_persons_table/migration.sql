/*
  Warnings:

  - The primary key for the `persons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ci_id_num]` on the table `persons` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_num_fkey";

-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_relative_fkey";

-- AlterTable
ALTER TABLE "public"."persons" DROP CONSTRAINT "persons_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "persons_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "persons_ci_id_num_key" ON "public"."persons"("ci_id_num");

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_num_fkey" FOREIGN KEY ("cf_id_num") REFERENCES "public"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_relative_fkey" FOREIGN KEY ("cf_id_relative") REFERENCES "public"."persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
