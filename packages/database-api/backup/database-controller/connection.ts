export interface QueryBuilder {
    query: string;
}

export abstract class Connection<TPool, TPoolConfig> {
    protected pool: TPool;

    abstract query(builder: QueryBuilder): Promise<Record<string, unknown>[]>;
    abstract initializePool(poolConfig: TPoolConfig): TPool;

    constructor(poolConfig: TPoolConfig) {
        this.pool = this.initializePool(poolConfig);
    }
}
