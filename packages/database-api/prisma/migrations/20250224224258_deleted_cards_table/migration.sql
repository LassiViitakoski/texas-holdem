/*
  Warnings:

  - You are about to drop the `_CardToRoundPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `round_community_card` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CardToRoundPlayer" DROP CONSTRAINT "_CardToRoundPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardToRoundPlayer" DROP CONSTRAINT "_CardToRoundPlayer_B_fkey";

-- DropForeignKey
ALTER TABLE "round_community_card" DROP CONSTRAINT "round_community_card_card_id_fkey";

-- DropForeignKey
ALTER TABLE "round_community_card" DROP CONSTRAINT "round_community_card_round_id_fkey";

-- AlterTable
ALTER TABLE "round" ADD COLUMN     "community_cards" TEXT[];

-- AlterTable
ALTER TABLE "round_player" ADD COLUMN     "cards" TEXT[];

-- DropTable
DROP TABLE "_CardToRoundPlayer";

-- DropTable
DROP TABLE "card";

-- DropTable
DROP TABLE "round_community_card";

-- DropEnum
DROP TYPE "CARD_RANK";

-- DropEnum
DROP TYPE "CARD_SUIT";
