import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories';

type PrismaLogType = 'info' | 'query' | 'warn' | 'error';

type DatabaseApiConstructor = {
    datasourceUrl?: string;
    log?: PrismaLogType[];
};

class DatabaseApi {
    private static instance: DatabaseApi;

    private readonly client: PrismaClient;

    public user: UserRepository;

    constructor(params: DatabaseApiConstructor = {}) {
        this.client = new PrismaClient(params);

        this.user = new UserRepository(this.client);
    }

    public static getInstance(params: DatabaseApiConstructor) {
        if (!this.instance) {
            this.instance = new DatabaseApi(params);
        }

        return this.instance;
    }
}

export { DatabaseApi };
