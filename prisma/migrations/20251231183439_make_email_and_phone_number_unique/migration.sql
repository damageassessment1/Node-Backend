/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `citizens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `citizens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[whatsapp_number]` on the table `citizens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "citizens_phone_number_key" ON "citizens"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_email_key" ON "citizens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_whatsapp_number_key" ON "citizens"("whatsapp_number");
