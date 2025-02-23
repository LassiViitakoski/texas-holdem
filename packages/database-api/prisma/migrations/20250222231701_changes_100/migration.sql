/*
  Warnings:

  - You are about to drop the column `round_player_id` on the `betting_round_action` table. All the data in the column will be lost.
  - Added the required column `betting_round_player_id` to the `betting_round_action` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "betting_round_action" DROP CONSTRAINT "betting_round_action_round_player_id_fkey";

-- AlterTable
ALTER TABLE "betting_round_action" DROP COLUMN "round_player_id",
ADD COLUMN     "betting_round_player_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "round_community_card" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "round_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,

    CONSTRAINT "round_community_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "betting_round_player" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "betting_round_id" INTEGER NOT NULL,
    "round_player_id" INTEGER NOT NULL,

    CONSTRAINT "betting_round_player_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "round_community_card" ADD CONSTRAINT "round_community_card_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_community_card" ADD CONSTRAINT "round_community_card_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_player" ADD CONSTRAINT "betting_round_player_betting_round_id_fkey" FOREIGN KEY ("betting_round_id") REFERENCES "betting_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_player" ADD CONSTRAINT "betting_round_player_round_player_id_fkey" FOREIGN KEY ("round_player_id") REFERENCES "round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_action" ADD CONSTRAINT "betting_round_action_betting_round_player_id_fkey" FOREIGN KEY ("betting_round_player_id") REFERENCES "betting_round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
