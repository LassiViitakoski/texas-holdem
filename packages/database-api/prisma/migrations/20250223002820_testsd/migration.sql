/*
  Warnings:

  - You are about to drop the column `value` on the `card` table. All the data in the column will be lost.
  - Added the required column `rank` to the `card` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CARD_RANK" AS ENUM ('TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE');

-- AlterTable
ALTER TABLE "card" DROP COLUMN "value",
ADD COLUMN     "rank" "CARD_RANK" NOT NULL;

-- DropEnum
DROP TYPE "CARD_VALUE";
