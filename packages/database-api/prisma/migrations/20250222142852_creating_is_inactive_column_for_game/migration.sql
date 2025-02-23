/*
  Warnings:

  - The values [INACTIVE] on the enum `GAME_TABLE_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GAME_TABLE_STATUS_new" AS ENUM ('ROUND_IN_PROGRESS', 'WAITING');
ALTER TABLE "game" ALTER COLUMN "status" TYPE "GAME_TABLE_STATUS_new" USING ("status"::text::"GAME_TABLE_STATUS_new");
ALTER TYPE "GAME_TABLE_STATUS" RENAME TO "GAME_TABLE_STATUS_old";
ALTER TYPE "GAME_TABLE_STATUS_new" RENAME TO "GAME_TABLE_STATUS";
DROP TYPE "GAME_TABLE_STATUS_old";
COMMIT;

-- AlterTable
ALTER TABLE "game" ADD COLUMN     "is_inactive" BOOLEAN NOT NULL DEFAULT false;
