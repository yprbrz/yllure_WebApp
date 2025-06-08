/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Dress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Dress_name_key" ON "Dress"("name");
