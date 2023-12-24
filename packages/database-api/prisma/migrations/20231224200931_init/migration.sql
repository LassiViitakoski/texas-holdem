-- CreateEnum
CREATE TYPE "CURRENCY" AS ENUM ('EUR', 'SEK', 'GDP', 'USD');

-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('BASIC', 'ADMIN');

-- CreateEnum
CREATE TYPE "CHIP_UNIT" AS ENUM ('CASH', 'CHIP');

-- CreateEnum
CREATE TYPE "GAME_TABLE_STATUS" AS ENUM ('ROUND_IN_PROGRESS', 'WAITING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ROUND_STAGE" AS ENUM ('PREFLOP', 'FLOP', 'TURN', 'RIVER');

-- CreateEnum
CREATE TYPE "BETTING_ROUND_ACTION" AS ENUM ('BET', 'CALL', 'CHECK', 'FOLD');

-- CreateEnum
CREATE TYPE "CARD_SUIT" AS ENUM ('CLUB', 'DIAMOND', 'HEART', 'SPADE');

-- CreateEnum
CREATE TYPE "CARD_VALUE" AS ENUM ('TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "USER_ROLE" NOT NULL DEFAULT 'BASIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "stack" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "currency" "CURRENCY" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card" (
    "id" SERIAL NOT NULL,
    "suit" "CARD_SUIT" NOT NULL,
    "value" "CARD_VALUE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "minimum_players" INTEGER NOT NULL DEFAULT 2,
    "maximum_players" INTEGER NOT NULL,
    "chip_unit" "CHIP_UNIT" NOT NULL,
    "rake" DECIMAL(65,30) NOT NULL,
    "status" "GAME_TABLE_STATUS" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blind" (
    "id" SERIAL NOT NULL,
    "blind_number" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round" (
    "id" SERIAL NOT NULL,
    "stage" "ROUND_STAGE" NOT NULL,
    "pot" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_round" (
    "id" SERIAL NOT NULL,
    "starting_stack" DECIMAL(65,30) NOT NULL,
    "is_winner" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "player_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,

    CONSTRAINT "player_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage" (
    "id" SERIAL NOT NULL,
    "type" "ROUND_STAGE" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "round_id" INTEGER NOT NULL,

    CONSTRAINT "stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_round_stage" (
    "id" SERIAL NOT NULL,
    "action" "BETTING_ROUND_ACTION" NOT NULL,
    "amount_payed" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "player_round_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,

    CONSTRAINT "player_round_stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardToPlayerRound" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlindToGame" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_CardToPlayerRound_AB_unique" ON "_CardToPlayerRound"("A", "B");

-- CreateIndex
CREATE INDEX "_CardToPlayerRound_B_index" ON "_CardToPlayerRound"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlindToGame_AB_unique" ON "_BlindToGame"("A", "B");

-- CreateIndex
CREATE INDEX "_BlindToGame_B_index" ON "_BlindToGame"("B");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_round" ADD CONSTRAINT "player_round_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_round" ADD CONSTRAINT "player_round_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage" ADD CONSTRAINT "stage_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_round_stage" ADD CONSTRAINT "player_round_stage_player_round_id_fkey" FOREIGN KEY ("player_round_id") REFERENCES "player_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_round_stage" ADD CONSTRAINT "player_round_stage_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToPlayerRound" ADD CONSTRAINT "_CardToPlayerRound_A_fkey" FOREIGN KEY ("A") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToPlayerRound" ADD CONSTRAINT "_CardToPlayerRound_B_fkey" FOREIGN KEY ("B") REFERENCES "player_round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlindToGame" ADD CONSTRAINT "_BlindToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "blind"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlindToGame" ADD CONSTRAINT "_BlindToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
