/*
  Warnings:

  - You are about to drop the column `stage` on the `round` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "round" DROP COLUMN "stage",
ADD COLUMN     "is_finished" BOOLEAN NOT NULL DEFAULT false;
