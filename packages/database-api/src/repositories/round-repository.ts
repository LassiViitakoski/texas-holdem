import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { BettingRoundPlayerAction } from '@prisma/client';
import type { RoundPlayer } from '@texas-holdem/shared-types';

type CreateRoundData = {
  pot: Decimal;
  players: (Pick<RoundPlayer, 'stack' | 'playerId'> & { cards: string[] })[];
  gameId: number;
  actions: Omit<BettingRoundPlayerAction, 'id' | 'bettingRoundPlayerId' | 'createdAt' | 'updatedAt'>[];
};

export class RoundRepository {
  constructor(private client: PrismaClient) {}

  public async create(data: CreateRoundData) {
    return this.client.$transaction(async (tx) => {
      // 2. Create round with players
      const round = await tx.round.create({
        data: {
          pot: data.pot,
          gameId: data.gameId,
          roundPlayers: {
            create: data.players.map(({
              stack,
              cards,
              playerId,
            }) => ({
              playerId,
              stack,
              cards,
            })),
          },
        },
        select: {
          id: true,
          pot: true,
          isFinished: true,
          roundPlayers: {
            select: {
              id: true,
              stack: true,
              playerId: true,
              cards: true,
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
            create: round.roundPlayers.map((roundPlayer, index) => ({
              roundPlayer: { connect: { id: roundPlayer.id } },
              stack: roundPlayer.stack,
              position: index + 1,
              actions: data.actions[index] ? {
                create: {
                  sequence: data.actions[index].sequence,
                  type: data.actions[index].type,
                  amount: data.actions[index].amount,
                },
              }
                : undefined,

            })),
          },
        },
        select: {
          id: true,
          type: true,
          isFinished: true,
          players: {
            select: {
              id: true,
              stack: true,
              position: true,
              roundPlayerId: true,
              actions: {
                select: {
                  id: true,
                  sequence: true,
                  type: true,
                  amount: true,
                  bettingRoundPlayerId: true,
                },
              },
            },
          },
        },
      });

      return {
        ...round,
        firstBettingRound,
      };
    });
  }
}
