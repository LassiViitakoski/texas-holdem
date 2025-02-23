/*
  Warnings:

  - You are about to drop the column `blind_number` on the `blind` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blind" DROP COLUMN "blind_number",
ADD COLUMN     "sequence" INTEGER NOT NULL DEFAULT 0;
