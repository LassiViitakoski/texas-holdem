/*
  Warnings:

  - You are about to drop the `betting_round_players` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `betting_round` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BETTING_ROUND" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');

-- DropForeignKey
ALTER TABLE "betting_round_players" DROP CONSTRAINT "betting_round_players_betting_round_id_fkey";

-- DropForeignKey
ALTER TABLE "betting_round_players" DROP CONSTRAINT "betting_round_players_round_player_id_fkey";

-- AlterTable
ALTER TABLE "betting_round" DROP COLUMN "type",
ADD COLUMN     "type" "BETTING_ROUND" NOT NULL;

-- DropTable
DROP TABLE "betting_round_players";

-- DropEnum
DROP TYPE "BETTING_ROUND_TYPE";

-- CreateTable
CREATE TABLE "betting_round_action" (
    "id" SERIAL NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "BETTING_ROUND_ACTION" NOT NULL,
    "amount_payed" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "round_player_id" INTEGER NOT NULL,
    "betting_round_id" INTEGER NOT NULL,

    CONSTRAINT "betting_round_action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "betting_round_action" ADD CONSTRAINT "betting_round_action_round_player_id_fkey" FOREIGN KEY ("round_player_id") REFERENCES "round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_action" ADD CONSTRAINT "betting_round_action_betting_round_id_fkey" FOREIGN KEY ("betting_round_id") REFERENCES "betting_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
