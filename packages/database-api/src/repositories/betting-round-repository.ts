import { PrismaClient, BettingRound } from '@prisma/client';

export class BettingRoundRepository {
  constructor(private readonly client: PrismaClient) {}

  async update(id: number, data: Partial<BettingRound>) {
    return this.client.bettingRound.update({
      where: { id },
      data,
    });
  }
}
