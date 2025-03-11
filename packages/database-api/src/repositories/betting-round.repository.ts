import { PrismaClient, BettingRound } from '@prisma/client';

export class BettingRoundRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(data: Omit<BettingRound, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.client.bettingRound.create({
      data,
    });
  }

  async update(id: number, data: Partial<BettingRound>) {
    return this.client.bettingRound.update({
      where: { id },
      data,
    });
  }
}
