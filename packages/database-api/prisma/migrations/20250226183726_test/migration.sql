/*
  Warnings:

  - You are about to drop the column `sequence` on the `round_player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "round_player" DROP COLUMN "sequence";

-- CreateTable
CREATE TABLE "table_position" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDealer" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,

    CONSTRAINT "table_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "table_position_game_id_position_key" ON "table_position"("game_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "table_position_game_id_player_id_key" ON "table_position"("game_id", "player_id");

-- AddForeignKey
ALTER TABLE "table_position" ADD CONSTRAINT "table_position_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_position" ADD CONSTRAINT "table_position_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
