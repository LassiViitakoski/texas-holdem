import { PrismaClient } from '@prisma/client';

type PrismaLogType = 'info' | 'query' | 'warn' | 'error';
type DatabaseApiConstructor = {
    datasourceUrl?: string;
    log?: PrismaLogType[];
};

class DatabaseApi {
    private static instance: DatabaseApi;

    private readonly client: PrismaClient;

    private datasourceUrl: string;

    private log: PrismaLogType[];

    constructor(params: DatabaseApiConstructor = {}) {
        this.datasourceUrl = params.datasourceUrl || '';
        this.log = (params.log || []).sort();
        this.client = new PrismaClient(params);
    }

    private static instanceNeedsReplacement(params: DatabaseApiConstructor) {
        const datasourceUrl = params.datasourceUrl || '';
        const sortedLog = (params.log || []).sort();

        if (datasourceUrl !== this.instance.datasourceUrl) {
            return true;
        }

        if (this.instance.log.length !== sortedLog.length) {
            for (let index = 0; index < sortedLog.length; index += 1) {
                if (sortedLog[index] !== this.instance.log[index]) {
                    return true;
                }
            }
        }

        return false;
    }

    public static getInstance(params: DatabaseApiConstructor) {
        if (!this.instance) {
            this.instance = new DatabaseApi(params);
        }

        if (this.instanceNeedsReplacement(params)) {
            this.instance = new DatabaseApi(params);
        }

        return this.instance;
    }
}

export { DatabaseApi };
