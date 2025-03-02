/*
  Warnings:

  - You are about to drop the column `sequence` on the `betting_round_player_action` table. All the data in the column will be lost.
  - Added the required column `position` to the `betting_round_player_action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "betting_round_player_action" DROP COLUMN "sequence",
ADD COLUMN     "position" INTEGER NOT NULL;
