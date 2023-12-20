/* eslint-disable max-classes-per-file,class-methods-use-this,max-len */

import { Pool, PoolConfig } from 'pg';

export class DatabaseController {
    private static instance: DatabaseController;
    private connections: Connection[];


    public static getInstance(): DatabaseController {
        if (!DatabaseController.instance) {
            DatabaseController.instance = new DatabaseController();
        }

        return DatabaseController.instance;
    }


    public initializeConnection<T, K>(connection: Connection<T, K>) {
        
    }
}

abstract class DatabaseModel<T, K> {
    protected connection: Connection<T, K>;

    // static instance<StaticT, StaticK>(connection: Connection) {
    //     return new DatabaseModel(connection);
    // }

    constructor(connection: Connection<T, K>) {
        this.connection = connection;
        // console.log('Databasemodel');
        // console.log(DatabaseModel.connection);

        // if (!DatabaseModel.connection) {
        //     DatabaseModel.connection = 'testing-connection'
        // }
    }
}


abstract class Connection<TPool, TPoolConfig> {
    protected pool: TPool;

    abstract query(builder: QueryBuilder): Promise<Record<string, unknown>[]>;
    abstract initializePool(poolConfig: TPoolConfig): TPool;

    constructor(poolConfig: TPoolConfig) {
        this.pool = this.initializePool(poolConfig);
    }
}

interface QueryBuilder {
    query: string;
}

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


const controller = DatabaseController.getInstance();

controller.initializeConnection(new PGConnection({ allowExitOnIdle: true }))