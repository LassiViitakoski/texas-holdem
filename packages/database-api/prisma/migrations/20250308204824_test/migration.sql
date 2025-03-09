/*
  Warnings:

  - Changed the type of `type` on the `betting_round_player_action` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "POKER_ACTION" AS ENUM ('BLIND', 'CALL', 'CHECK', 'FOLD', 'RAISE');

-- AlterTable
ALTER TABLE "betting_round_player_action" DROP COLUMN "type",
ADD COLUMN     "type" "POKER_ACTION" NOT NULL;

-- DropEnum
DROP TYPE "BETTING_ROUND_PLAYER_ACTION";
