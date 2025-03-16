import { PrismaClient } from '@prisma/client';
import {
  GameRepository,
  RoundRepository,
  PlayerRepository,
  UserRepository,
  TablePositionRepository,
  BettingRoundRepository,
  BettingRoundActionRepository,
  BettingRoundPlayerRepository,
  RoundPlayerRepository,
} from './repositories';
import { DatabaseService } from './core/database.service';

export class DatabaseApi {
  private static instance: DatabaseApi;

  private readonly client: PrismaClient;

  public readonly service: DatabaseService;

  public readonly user: UserRepository;

  public readonly game: GameRepository;

  public readonly round: RoundRepository;

  public readonly tablePosition: TablePositionRepository;

  public readonly bettingRound: BettingRoundRepository;

  public readonly bettingRoundAction: BettingRoundActionRepository;

  public readonly player: PlayerRepository;

  public readonly roundPlayer: RoundPlayerRepository;

  public readonly bettingRoundPlayer: BettingRoundPlayerRepository;

  private constructor() {
    this.client = new PrismaClient();
    this.service = new DatabaseService(this.client);
    this.user = new UserRepository(this.client);
    this.game = new GameRepository(this.client);
    this.round = new RoundRepository(this.client);
    this.tablePosition = new TablePositionRepository(this.client);
    this.bettingRound = new BettingRoundRepository(this.client);
    this.bettingRoundAction = new BettingRoundActionRepository(this.client);
    this.player = new PlayerRepository(this.client);
    this.roundPlayer = new RoundPlayerRepository(this.client);
    this.bettingRoundPlayer = new BettingRoundPlayerRepository(this.client);
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
    await this.client.bettingRoundAction.deleteMany();
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
