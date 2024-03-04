/*
  Warnings:

  - Added the required column `metadata` to the `Embedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Embedding" ADD COLUMN     "metadata" JSONB NOT NULL;
