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
      select: {
        id: true,
        minimumPlayers: true,
        maximumPlayers: true,
        chipUnit: true,
        rake: true,
        blinds: {
          select: {
            id: true,
            sequence: true,
            amount: true,
          },
        },
        players: {
          select: {
            id: true,
            stack: true,
            userId: true,
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
          select: {
            roundPlayers: {
              select: {
                id: true,
                stack: true,
                cards: true,
                playerId: true,
              },
            },
            bettingRounds: {
              select: {
                id: true,
                type: true,
                isFinished: true,
                players: {
                  select: {
                    id: true,
                    stack: true,
                    sequence: true,
                    roundPlayerId: true,
                    actions: {
                      select: {
                        id: true,
                        type: true,
                        sequence: true,
                        amount: true,
                        bettingRoundPlayerId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tablePositions: {
          select: {
            id: true,
            position: true,
            isActive: true,
            isDealer: true,
            playerId: true,
          },
        },
      },
    });
  }

  async getGame(id: number) {
    const game = await this.client.game.findUnique({
      where: { id },
      select: {
        id: true,
        minimumPlayers: true,
        maximumPlayers: true,
        chipUnit: true,
        rake: true,
        createdAt: true,
        updatedAt: true,
        blinds: {
          select: {
            id: true,
            sequence: true,
            amount: true,
          },
          orderBy: {
            sequence: 'asc',
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
    await this.client.bettingRoundPlayerAction.deleteMany();
    await this.client.bettingRoundPlayer.deleteMany();
    await this.client.bettingRound.deleteMany();
    await this.client.roundPlayer.deleteMany();
    await this.client.round.deleteMany();
    await this.client.player.deleteMany();
    console.log('Rounds cleared');
  }
}
