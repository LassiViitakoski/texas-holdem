/*
  Warnings:

  - Added the required column `betting_round_id` to the `betting_round_player_action` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "betting_round_player_action" ADD COLUMN     "betting_round_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "betting_round_player_action" ADD CONSTRAINT "betting_round_player_action_betting_round_id_fkey" FOREIGN KEY ("betting_round_id") REFERENCES "betting_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
