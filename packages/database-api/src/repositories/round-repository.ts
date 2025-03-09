import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { BettingRoundAction, RoundPlayer } from '@prisma/client';

type CreateRoundData = {
  pot: Decimal;
  players: (Pick<RoundPlayer, 'initialStack' | 'playerId' | 'position'> & { cards: string[] })[];
  gameId: number;
  actions: Pick<BettingRoundAction, 'sequence' | 'type' | 'amount'>[];
};

export class RoundRepository {
  constructor(private client: PrismaClient) {}

  public async initiate(data: CreateRoundData) {
    return this.client.$transaction(async (tx) => {
      // 2. Create round with players
      const round = await tx.round.create({
        data: {
          pot: data.pot,
          gameId: data.gameId,
          roundPlayers: {
            create: data.players.map(({
              initialStack, cards, playerId, position,
            }) => ({
              playerId, initialStack, cards, position,
            })),
          },
        },
        include: {
          roundPlayers: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      // 4. Create betting round players in bulk
      const firstBettingRound = await tx.bettingRound.create({
        data: {
          roundId: round.id,
          type: 'PREFLOP',
          players: {
            create: round.roundPlayers.map((roundPlayer) => ({
              roundPlayer: { connect: { id: roundPlayer.id } },
              position: roundPlayer.position,
            })),
          },
        },
        include: {
          actions: true,
          players: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      const actions = await tx.bettingRoundAction.createManyAndReturn({
        data: data.actions.map((action) => {
          const bettingRoundPlayer = firstBettingRound
            .players
            .find((brPlayer) => brPlayer.position === action.sequence);

          if (!bettingRoundPlayer) {
            throw new Error('Betting round player not found on {RoundRepository.create()}');
          }

          return {
            amount: action.amount,
            sequence: action.sequence,
            type: action.type,
            bettingRoundId: firstBettingRound.id,
            bettingRoundPlayerId: bettingRoundPlayer.id,
          };
        }),
      });

      // Replace the updateMany with multiple updates in transaction
      const playerUpdates = await Promise.all(
        actions.map((action, index) => {
          const { playerId } = data.players[index];
          return tx.player.update({
            where: { id: playerId },
            data: {
              stack: {
                decrement: action.amount,
              },
            },
            select: {
              id: true,
              stack: true,
            },
          });
        }),
      );

      return {
        ...round,
        firstBettingRound: { ...firstBettingRound, actions },
        playerStacks: Object.fromEntries(playerUpdates.map((update) => [update.id, update.stack])),

      };
    });
  }
}
