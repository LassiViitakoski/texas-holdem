/*
  Warnings:

  - Changed the type of `type` on the `betting_round` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ROUND_PHASE" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');

-- AlterTable
ALTER TABLE "betting_round" DROP COLUMN "type",
ADD COLUMN     "type" "ROUND_PHASE" NOT NULL;

-- DropEnum
DROP TYPE "BETTING_ROUND";
