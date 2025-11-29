-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_num_fkey";

-- DropForeignKey
ALTER TABLE "public"."relations" DROP CONSTRAINT "relations_cf_id_relative_fkey";

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_num_fkey" FOREIGN KEY ("cf_id_num") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relations" ADD CONSTRAINT "relations_cf_id_relative_fkey" FOREIGN KEY ("cf_id_relative") REFERENCES "public"."persons"("ci_id_num") ON DELETE RESTRICT ON UPDATE CASCADE;
