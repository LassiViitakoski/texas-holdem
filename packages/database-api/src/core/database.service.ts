import { PrismaClient } from '@prisma/client';

type TxCallback<T, K> = T extends (arg: infer P) => any
  ? P extends (arg: infer Z) => any
    ? (arg: Z) => K
    : never
  : never;

export class DatabaseService {
  constructor(private readonly client: PrismaClient) {}

  async executeTransaction<T>(
    callback: TxCallback<typeof this.client.$transaction, T>,
  ): Promise<T> {
    return this.client.$transaction((params) => callback(params) as Promise<T>);
  }

  // Could add more utility methods like:
  // - Connection management
  // - Query builders
  // - Batch operations
  // - Error handling
  // - Migrations
  // - Health checks
  // - Performance monitoring
  // etc.
}
