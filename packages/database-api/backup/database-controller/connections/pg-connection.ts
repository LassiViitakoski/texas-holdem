import { Pool, PoolConfig } from "pg";
import { Connection, QueryBuilder } from "../connection";

export class PGConnection extends Connection<Pool, PoolConfig> {
    public async query(builder: QueryBuilder) {
        const client = await this.pool.connect();
        return client
            .query<Record<string, unknown>>(builder.query, [])
            .then((queryResult) => queryResult.rows)
            .finally(() => client.release());
    }

    public initializePool(poolConfig: PoolConfig): Pool {
        return new Pool(poolConfig);
    }
}