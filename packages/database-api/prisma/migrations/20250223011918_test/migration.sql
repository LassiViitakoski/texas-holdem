/*
  Warnings:

  - You are about to drop the column `betting_round_id` on the `betting_round_action` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "betting_round_action" DROP CONSTRAINT "betting_round_action_betting_round_id_fkey";

-- AlterTable
ALTER TABLE "betting_round_action" DROP COLUMN "betting_round_id";
