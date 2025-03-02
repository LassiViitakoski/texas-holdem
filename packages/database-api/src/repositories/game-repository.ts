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
            position: index + 1,
            amount,
          })),
        },
        tablePositions: {
          create: Array.from({ length: data.maximumPlayers }).map((_, index) => ({
            position: index + 1,
          })),
        },
      },
      include: {
        tablePositions: true,
        blinds: true,
        players: {
          include: {
            user: {
              select: {
                username: true,
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
        isInactive: false,
      },
      include: {
        blinds: true,
        tablePositions: true,
        players: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
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
      },

    });
  }

  async getGame(id: number) {
    const game = await this.client.game.findUnique({
      where: { id },
      include: {
        blinds: true,
        tablePositions: true,
        players: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  async clearRounds() {
    await this.client.tablePosition.deleteMany();
    await this.client.bettingRoundPlayerAction.deleteMany();
    await this.client.bettingRoundPlayer.deleteMany();
    await this.client.bettingRound.deleteMany();
    await this.client.roundPlayer.deleteMany();
    await this.client.round.deleteMany();
    await this.client.player.deleteMany();
    console.log('Rounds cleared');
  }
}
