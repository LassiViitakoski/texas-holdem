-- DropForeignKey
ALTER TABLE "table_position" DROP CONSTRAINT "table_position_player_id_fkey";

-- AlterTable
ALTER TABLE "table_position" ALTER COLUMN "player_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "table_position" ADD CONSTRAINT "table_position_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
