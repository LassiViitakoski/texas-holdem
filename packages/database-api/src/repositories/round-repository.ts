import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { BettingRoundAction } from '@prisma/client';
import type { RoundPlayer } from '@texas-holdem/shared-types';

type CreateRoundData = {
  pot: Decimal;
  players: (Pick<RoundPlayer, 'stack' | 'playerId'> & { cards: string[] })[];
  gameId: number;
  actions: Pick<BettingRoundAction, 'sequence' | 'type' | 'amount'>[];
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
            })),
          },
        },
        include: {
          actions: true,
          players: true,
        },
      });

      console.log('ACTIONS', data.actions);

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

      return {
        ...round,
        firstBettingRound: { ...firstBettingRound, actions },
      };
    });
  }
}
