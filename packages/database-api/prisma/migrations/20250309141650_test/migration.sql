/*
  Warnings:

  - You are about to drop the column `stack` on the `betting_round_player` table. All the data in the column will be lost.
  - You are about to drop the column `stack` on the `round_player` table. All the data in the column will be lost.
  - Added the required column `initial_stack` to the `round_player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "betting_round_player" DROP COLUMN "stack";

-- AlterTable
ALTER TABLE "round_player" DROP COLUMN "stack",
ADD COLUMN     "initial_stack" DECIMAL(65,30) NOT NULL;
