import { PrismaClient } from '@prisma/client';

export class GameRepository {
  constructor(private client: PrismaClient) {}

  create(data: {
    blinds: number[];
    maxPlayers: number;
  }) {
    return this.client.game.create({
      data: {
        maximumPlayers: data.maxPlayers,
        minimumPlayers: 2,
        chipUnit: 'CHIP',
        rake: 0.00,
        blinds: {
          create: data.blinds.map((amount, index) => ({
            blindNumber: index + 1,
            amount,
          })),
        },
      },
      include: {
        blinds: true,
        players: true,
      },
    });
  }

  findActiveGames() {
    return this.client.game.findMany({
      where: {
        isInactive: false,
      },
      include: {
        rounds: {
          where: {
            isFinished: false,
          },
          include: {
            roundPlayers: true,
            bettingRounds: {
              include: {
                players: {
                  include: {
                    actions: true,
                  },
                },
              },
            },
          },
        },
        blinds: true,
        players: true,
      },
    });
  }
}
