/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Driver_phone_number_key" ON "Driver"("phone_number");
