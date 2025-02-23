/*
  Warnings:

  - The `status` column on the `game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `stack` on the `player` table. All the data in the column will be lost.
  - You are about to drop the `round_stage_player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GAME_STATUS" AS ENUM ('ROUND_IN_PROGRESS', 'WAITING');

-- CreateEnum
CREATE TYPE "BETTING_ROUND_TYPE" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');

-- DropForeignKey
ALTER TABLE "round_stage_player" DROP CONSTRAINT "round_stage_player_round_player_id_fkey";

-- DropForeignKey
ALTER TABLE "round_stage_player" DROP CONSTRAINT "round_stage_player_stage_id_fkey";

-- DropForeignKey
ALTER TABLE "stage" DROP CONSTRAINT "stage_round_id_fkey";

-- AlterTable
ALTER TABLE "game" DROP COLUMN "status",
ADD COLUMN     "status" "GAME_STATUS";

-- AlterTable
ALTER TABLE "player" DROP COLUMN "stack",
ADD COLUMN     "chips" DECIMAL(65,30) NOT NULL DEFAULT 0.00;

-- DropTable
DROP TABLE "round_stage_player";

-- DropTable
DROP TABLE "stage";

-- DropEnum
DROP TYPE "GAME_TABLE_STATUS";

-- DropEnum
DROP TYPE "ROUND_STAGE";

-- CreateTable
CREATE TABLE "betting_round" (
    "id" SERIAL NOT NULL,
    "type" "BETTING_ROUND_TYPE" NOT NULL,
    "is_finished" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "round_id" INTEGER NOT NULL,

    CONSTRAINT "betting_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "betting_round_players" (
    "id" SERIAL NOT NULL,
    "action" "BETTING_ROUND_ACTION" NOT NULL,
    "amount_payed" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "round_player_id" INTEGER NOT NULL,
    "betting_round_id" INTEGER NOT NULL,

    CONSTRAINT "betting_round_players_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "betting_round" ADD CONSTRAINT "betting_round_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_players" ADD CONSTRAINT "betting_round_players_round_player_id_fkey" FOREIGN KEY ("round_player_id") REFERENCES "round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "betting_round_players" ADD CONSTRAINT "betting_round_players_betting_round_id_fkey" FOREIGN KEY ("betting_round_id") REFERENCES "betting_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
