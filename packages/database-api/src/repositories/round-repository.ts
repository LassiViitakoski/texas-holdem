import { PrismaClient } from '@prisma/client';
import type { Round, BettingRoundPlayerAction } from '@texas-holdem/shared-types';

type CreateRoundData = Pick<Round<'UNPERSISTED'>, 'pot' | 'players'> & { gameId: number; actions: BettingRoundPlayerAction<'UNPERSISTED'>[] };

export class RoundRepository {
  constructor(private client: PrismaClient) {}

  public async create(data: CreateRoundData) {
    data.players.map((s) => s);
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
              cards: {
                connect: cards.map((card) => ({ id: card.id })),
              },
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
