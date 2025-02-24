import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface CreatePlayerParams {
  gameId: number;
  stack: number;
  userId: number;
}

export class PlayerRepository {
  constructor(private client: PrismaClient) {}

  async create({ gameId, stack, userId }: CreatePlayerParams) {
    return this.client.player.create({
      data: {
        stack: new Decimal(stack),
        game: { connect: { id: gameId } },
        user: { connect: { id: userId } },
      },
      include: {
        game: {
          include: {
            players: {
              select: {
                _count: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async findByGame(gameId: number) {
    return this.client.player.findMany({
      where: {
        gameId,
      },
      include: {
        game: true,
      },
    });
  }
}
