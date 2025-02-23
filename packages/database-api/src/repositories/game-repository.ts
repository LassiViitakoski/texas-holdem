import { PrismaClient } from '@prisma/client';

export class GameRepository {
  constructor(private client: PrismaClient) {}

  create(data: {
    blinds: number[];
    maximumPlayers: number;
  }) {
    return this.client.game.create({
      data: {
        maximumPlayers: data.maximumPlayers,
        minimumPlayers: 2,
        chipUnit: 'CHIP',
        rake: 0.00,
        blinds: {
          create: data.blinds.map((amount, index) => ({
            sequence: index,
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

  async clearRounds() {
    await this.client.bettingRoundPlayerAction.deleteMany();
    await this.client.bettingRoundPlayer.deleteMany();
    await this.client.bettingRound.deleteMany();
    await this.client.roundPlayer.deleteMany();
    await this.client.round.deleteMany();
    console.log('Rounds cleared');
  }
}
