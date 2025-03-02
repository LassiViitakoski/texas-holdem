import { PrismaClient } from '@prisma/client';
import {
  GameRepository,
  RoundRepository,
  PlayerRepository,
  UserRepository,
  TablePositionRepository,
} from './repositories';

export class DatabaseApi {
  private static instance: DatabaseApi;

  private readonly client: PrismaClient;

  public readonly user: UserRepository;

  public readonly game: GameRepository;

  public readonly round: RoundRepository;

  public readonly player: PlayerRepository;

  public readonly tablePosition: TablePositionRepository;

  private constructor() {
    this.client = new PrismaClient();
    this.user = new UserRepository(this.client);
    this.game = new GameRepository(this.client);
    this.round = new RoundRepository(this.client);
    this.player = new PlayerRepository(this.client);
    this.tablePosition = new TablePositionRepository(this.client);
  }

  public static getInstance(): DatabaseApi {
    if (!this.instance) {
      this.instance = new DatabaseApi();
    }
    return this.instance;
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  public async resetDb(): Promise<void> {
    await this.client.tablePosition.deleteMany();
    await this.client.bettingRoundPlayerAction.deleteMany();
    await this.client.bettingRoundPlayer.deleteMany();
    await this.client.bettingRound.deleteMany();
    await this.client.roundPlayer.deleteMany();
    await this.client.round.deleteMany();
    await this.client.player.deleteMany();
    await this.client.blind.deleteMany();
    await this.client.game.deleteMany();
  }
}

export const db = DatabaseApi.getInstance();
