-- AlterTable
ALTER TABLE "public"."citizens" ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "family_name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."persons" (
    "ci_id_num" BIGINT NOT NULL,
    "ci_first_arb" TEXT,
    "ci_father_arb" TEXT,
    "ci_grand_father_arb" TEXT,
    "ci_family_arb" TEXT,
    "ci_birth_tb_cd" TEXT,
    "ci_birth_cd" TEXT,
    "ci_birth_dt" TEXT,
    "ci_sex_cd" TEXT,
    "ci_personal_cd" TEXT,
    "ci_dead_dt" TEXT,
    "mother_name1" TEXT,
    "citttty" TEXT,
    "city" TEXT,
    "street" TEXT,
    "regon" TEXT,
    "house_no" TEXT,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("ci_id_num")
);

-- CreateTable
CREATE TABLE "public"."relations" (
    "id" SERIAL NOT NULL,
    "cf_id_num" BIGINT NOT NULL,
    "cf_relative_cd" INTEGER NOT NULL,
    "cf_id_relative" BIGINT NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."codes" (
    "id" SERIAL NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,

    CONSTRAINT "codes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_num_fkey" FOREIGN KEY ("cf_id_num") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_relative_cd_fkey" FOREIGN KEY ("cf_relative_cd") REFERENCES "public"."codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_relative_fkey" FOREIGN KEY ("cf_id_relative") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;
