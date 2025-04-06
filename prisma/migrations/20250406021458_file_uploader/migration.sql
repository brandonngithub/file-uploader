/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_name_userId_key" ON "File"("name", "userId");
