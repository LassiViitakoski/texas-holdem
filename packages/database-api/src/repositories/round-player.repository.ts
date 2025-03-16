import { PrismaClient, RoundPlayer } from '@prisma/client';

export class RoundPlayerRepository {
  constructor(private client: PrismaClient) {}

  update(id: number, data: Partial<RoundPlayer>) {
    return this.client.roundPlayer.update({
      where: { id },
      data,
    });
  }
}
