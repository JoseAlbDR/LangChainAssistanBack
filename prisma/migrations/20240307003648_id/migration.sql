/*
  Warnings:

  - The primary key for the `ChatConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `ChatConfig` table. All the data in the column will be lost.
  - Added the required column `id` to the `ChatConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatConfig" DROP CONSTRAINT "ChatConfig_pkey",
DROP COLUMN "name",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ChatConfig_pkey" PRIMARY KEY ("id");
