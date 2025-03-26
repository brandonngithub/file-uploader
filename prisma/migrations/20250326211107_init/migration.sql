/*
  Warnings:

  - You are about to drop the column `parentId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_parentId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "parentId",
ADD COLUMN     "folderId" TEXT;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_key" ON "Folder"("name");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
