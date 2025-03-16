import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { BettingRoundAction, Round, RoundPlayer } from '@prisma/client';

type CreateRoundData = {
  pot: Decimal;
  players: (Pick<RoundPlayer, 'initialStack' | 'playerId' | 'position'> & { cards: string[] })[];
  gameId: number;
  actions: Pick<BettingRoundAction, 'sequence' | 'type' | 'amount'>[];
};

export class RoundRepository {
  constructor(private client: PrismaClient) {}

  update(id: number, data: Partial<Round>) {
    return this.client.round.update({
      where: { id },
      data,
    });
  }

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

      const isHeadsUpGame = data.players.length === 2 && data.actions.length;

      const actions = await tx.bettingRoundAction.createManyAndReturn({
        data: data.actions.map((action) => {
          const bettingRoundPlayer = isHeadsUpGame
            ? firstBettingRound
              .players.find((brPlayer) => (
                (action.sequence === 1 && brPlayer.position === 2)
                || (action.sequence === 2 && brPlayer.position === 1)
              ))
            : firstBettingRound
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
        include: {
          bettingRoundPlayer: {
            include: {
              roundPlayer: {
                select: {
                  playerId: true,
                },
              },
            },
          },
        },
      });

      // Replace the updateMany with multiple updates in transaction
      const playerUpdates = await Promise.all(
        actions.map((action) => tx.player.update({
          where: { id: action.bettingRoundPlayer.roundPlayer.playerId },
          data: {
            stack: {
              decrement: action.amount,
            },
          },
          select: {
            id: true,
            stack: true,
            userId: true,
          },
        })),
      );

      return {
        ...round,
        firstBettingRound: { ...firstBettingRound, actions },
        playerStacks: Object.fromEntries(playerUpdates.map((update) => [
          update.id,
          {
            userId: update.userId,
            updatedStack: update.stack,
          },
        ])),
      };
    });
  }

  public async updatePot(roundId: number, amount: Decimal) {
    return this.client.round.update({
      where: { id: roundId },
      data: { pot: { increment: amount } },
      select: {
        pot: true,
      },
    });
  }

  public async updateCommunityCards(roundId: number, newCards: string[]) {
    return this.client.round.update({
      where: { id: roundId },
      data: { communityCards: { push: newCards } },
      select: {
        communityCards: true,
      },
    });
  }
}
