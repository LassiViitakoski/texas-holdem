import { PrismaClient } from '@prisma/client';
import type { IRound, IBettingRoundPlayerAction } from '@texas-holdem/shared-types';

type CreateRoundData = Pick<IRound<'UNPERSISTED'>, 'pot' | 'players'> & {
  gameId: number;
  actions: IBettingRoundPlayerAction<'UNPERSISTED'>[];
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
              sequence,
              cards,
              playerId,
            }) => ({
              playerId,
              stack,
              sequence,
              cards,
            })),
          },
        },
        include: { roundPlayers: true },
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
              sequence: roundPlayer.sequence,
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
        include: { players: { include: { actions: true } } },
      });

      return {
        ...round,
        bettingRounds: [firstBettingRound],
      };
    });
  }
}
