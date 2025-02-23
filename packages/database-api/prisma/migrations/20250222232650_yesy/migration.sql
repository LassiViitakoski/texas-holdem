/*
  Warnings:

  - The values [BET] on the enum `BETTING_ROUND_ACTION` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount_payed` on the `betting_round_action` table. All the data in the column will be lost.
  - You are about to drop the column `chips` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `starting_stack` on the `round_player` table. All the data in the column will be lost.
  - Added the required column `initial_stack` to the `betting_round_player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initial_stack` to the `round_player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BETTING_ROUND_ACTION_new" AS ENUM ('BLIND', 'CALL', 'CHECK', 'FOLD', 'RAISE');
ALTER TABLE "betting_round_action" ALTER COLUMN "type" TYPE "BETTING_ROUND_ACTION_new" USING ("type"::text::"BETTING_ROUND_ACTION_new");
ALTER TYPE "BETTING_ROUND_ACTION" RENAME TO "BETTING_ROUND_ACTION_old";
ALTER TYPE "BETTING_ROUND_ACTION_new" RENAME TO "BETTING_ROUND_ACTION";
DROP TYPE "BETTING_ROUND_ACTION_old";
COMMIT;

-- AlterTable
ALTER TABLE "betting_round_action" DROP COLUMN "amount_payed",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "betting_round_player" ADD COLUMN     "initial_stack" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "player" DROP COLUMN "chips",
ADD COLUMN     "stack" DECIMAL(65,30) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "round_player" DROP COLUMN "starting_stack",
ADD COLUMN     "initial_stack" DECIMAL(65,30) NOT NULL;
