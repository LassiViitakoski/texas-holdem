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
        status: 'WAITING',
        blinds: {
          create: data.blinds.map((amount, index) => ({
            blindNumber: index + 1,
            amount,
          })),
        },
      },
    });
  }

  findById(id: number) {
    return this.client.game.findUnique({
      where: { id },
      include: {
        players: true,
        blinds: true,
        rounds: {
          where: { isFinished: false },
          include: {
            stages: {
              include: {
                players: true,
              },
            },
          },
        },
      },
    });
  }

  findActiveGames() {
    return this.client.game.findMany({
      where: {
        status: 'ROUND_IN_PROGRESS',
      },
      include: {
        rounds: {
          where: {
            isFinished: false,
          },
          include: {
            stages: {
              include: {
                players: true,
              },
            },
          },
        },
      },
    });
  }
}
