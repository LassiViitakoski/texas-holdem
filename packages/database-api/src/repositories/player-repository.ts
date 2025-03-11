import { Player, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface CreatePlayerParams {
  gameId: number;
  stack: number;
  userId: number;
  positionId: number;
}

export class PlayerRepository {
  constructor(private client: PrismaClient) {}

  async create({
    gameId,
    stack,
    userId,
    positionId,
  }: CreatePlayerParams) {
    return this.client.player.create({
      data: {
        stack: new Decimal(stack),
        game: { connect: { id: gameId } },
        user: { connect: { id: userId } },
        tablePosition: {
          connect: {
            id: positionId,
          },
        },
      },
      select: {
        id: true,
        stack: true,
        userId: true,
        user: {
          select: {
            username: true,
          },
        },
        tablePosition: {
          select: {
            id: true,
            gameId: true,
            isActive: true,
            isDealer: true,
            playerId: true,
            position: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Partial<Player>) {
    return this.client.player.update({
      where: { id },
      data,
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
