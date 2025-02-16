/*
  Warnings:

  - You are about to drop the `_CardToPlayerRound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_round` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_round_stage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CardToPlayerRound" DROP CONSTRAINT "_CardToPlayerRound_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardToPlayerRound" DROP CONSTRAINT "_CardToPlayerRound_B_fkey";

-- DropForeignKey
ALTER TABLE "player_round" DROP CONSTRAINT "player_round_player_id_fkey";

-- DropForeignKey
ALTER TABLE "player_round" DROP CONSTRAINT "player_round_round_id_fkey";

-- DropForeignKey
ALTER TABLE "player_round_stage" DROP CONSTRAINT "player_round_stage_player_round_id_fkey";

-- DropForeignKey
ALTER TABLE "player_round_stage" DROP CONSTRAINT "player_round_stage_stage_id_fkey";

-- DropTable
DROP TABLE "_CardToPlayerRound";

-- DropTable
DROP TABLE "player_round";

-- DropTable
DROP TABLE "player_round_stage";

-- CreateTable
CREATE TABLE "round_player" (
    "id" SERIAL NOT NULL,
    "starting_stack" DECIMAL(65,30) NOT NULL,
    "is_winner" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "player_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,

    CONSTRAINT "round_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_stage_player" (
    "id" SERIAL NOT NULL,
    "action" "BETTING_ROUND_ACTION" NOT NULL,
    "amount_payed" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "round_player_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,

    CONSTRAINT "round_stage_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardToRoundPlayer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CardToRoundPlayer_AB_unique" ON "_CardToRoundPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_CardToRoundPlayer_B_index" ON "_CardToRoundPlayer"("B");

-- AddForeignKey
ALTER TABLE "round_player" ADD CONSTRAINT "round_player_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_player" ADD CONSTRAINT "round_player_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_stage_player" ADD CONSTRAINT "round_stage_player_round_player_id_fkey" FOREIGN KEY ("round_player_id") REFERENCES "round_player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_stage_player" ADD CONSTRAINT "round_stage_player_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToRoundPlayer" ADD CONSTRAINT "_CardToRoundPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToRoundPlayer" ADD CONSTRAINT "_CardToRoundPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "round_player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
