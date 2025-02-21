import { PrismaClient } from '@prisma/client';
import { GameRepository, UserRepository } from './repositories';

export class DatabaseApi {
  private static instance: DatabaseApi;

  private readonly client: PrismaClient;

  public readonly user: UserRepository;

  public readonly game: GameRepository;

  private constructor() {
    this.client = new PrismaClient();
    this.user = new UserRepository(this.client);
    this.game = new GameRepository(this.client);
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
}
