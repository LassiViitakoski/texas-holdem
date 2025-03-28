/*
  Warnings:

  - You are about to drop the `betting_round_player_action` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "betting_round_player_action" DROP CONSTRAINT "betting_round_player_action_betting_round_id_fkey";

-- DropForeignKey
ALTER TABLE "betting_round_player_action" DROP CONSTRAINT "betting_round_player_action_betting_round_player_id_fkey";

-- DropTable
DROP TABLE "betting_round_player_action";

-- CreateTable
CREATE TABLE "betting_round_action" (
    "id" SERIAL NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "POKER_ACTION" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betting_round_id" INTEGER NOT NULL,
    "betting_round_player_id" INTEGER NOT NULL,

    CONSTRAINT "betting_round_action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "betting_round_action" ADD CONSTRAINT "betting_round_action_betting_round_id_fkey" FOREIGN KEY ("betting_round_id") REFERENCES "betting_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_action" ADD CONSTRAINT "betting_round_action_betting_round_player_id_fkey" FOREIGN KEY ("betting_round_player_id") REFERENCES "betting_round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
