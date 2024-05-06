/*
  Warnings:

  - A unique constraint covering the columns `[createdBy,name]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_createdBy_name_key" ON "Document"("createdBy", "name");
