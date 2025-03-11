import { PrismaClient, BettingRoundPlayer } from '@prisma/client';

export class BettingRoundPlayerRepository {
  constructor(private readonly client: PrismaClient) {}

  async createMany(data: Pick<BettingRoundPlayer, 'roundPlayerId' | 'bettingRoundId' | 'position'>[]) {
    const brPlayers = await this.client.bettingRoundPlayer.createManyAndReturn({
      data,
    });
    return brPlayers.sort((a, b) => a.position - b.position);
  }
}
