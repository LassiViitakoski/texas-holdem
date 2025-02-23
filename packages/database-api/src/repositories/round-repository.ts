import { PrismaClient } from '@prisma/client';

interface CreateRoundData {
  gameId: number;
  players: {
    id: number;
    blind: number;
    stack: number;
    cards: number[];
  }[];
}

export class RoundRepository {
  constructor(private client: PrismaClient) {}

  public async create(data: CreateRoundData) {
    return this.client.$transaction(async (tx) => {
      // 2. Create round with players
      const round = await tx.round.create({
        data: {
          pot: data.players.reduce((acc, player) => acc + player.blind, 0),
          gameId: data.gameId,
          roundPlayers: {
            create: data.players.map((player, index) => ({
              playerId: player.id,
              initialStack: player.stack,
              sequence: index + 1,
              cards: {
                connect: player.cards.map((cardId) => ({ id: cardId })),
              },
            })),
          },
        },
        include: { roundPlayers: true },
      });

      // 4. Create betting round players in bulk
      await tx.bettingRound.create({
        data: {
          roundId: round.id,
          type: 'PREFLOP',
          players: {
            create: round.roundPlayers.map((roundPlayer, index) => ({
              roundPlayer: { connect: { id: roundPlayer.id } },
              initialStack: roundPlayer.initialStack,
              actions: data.players[index].blind > 0 ? {
                create: {
                  sequence: index + 1,
                  type: 'BLIND',
                  amount: data.players[index].blind,
                },
              }
                : undefined,
            })),
          },
        },
      });

      return round;
    });
  }
}
