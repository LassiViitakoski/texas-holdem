import { Connection } from "./connection";

export * from './connections'

export class DatabaseController<T, K> {
  private static instance: DatabaseController<unknown, unknown>;

  private connection: Connection<T, K> | null = null;

  private constructor() {}

  public static getInstance<T, K>() {
    if (!DatabaseController.instance) {
      DatabaseController.instance = new DatabaseController<T, K>();
    }

    return DatabaseController.instance as DatabaseController<T, K>;
  }

  public initializeConnection(connection: Connection<T, K>) {
    this.connection = connection;
  }

  public async query(q: string) {
    if (!this.connection) {
      throw new Error('Database connection not initialized properly...');
    }

    return this.connection.query({ query: q });
  }
}
