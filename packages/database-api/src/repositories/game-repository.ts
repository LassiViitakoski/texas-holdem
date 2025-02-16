import { PrismaClient } from '@prisma/client';

export class GameRepository {
  constructor(private client: PrismaClient) {}

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
