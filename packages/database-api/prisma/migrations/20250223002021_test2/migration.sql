/*
  Warnings:

  - Added the required column `sequence` to the `round_player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "round_player" ADD COLUMN     "sequence" INTEGER NOT NULL;
