import { UserRepository } from './repositories';
type PrismaLogType = 'info' | 'query' | 'warn' | 'error';
type DatabaseApiConstructor = {
    datasourceUrl?: string;
    log?: PrismaLogType[];
};
declare class DatabaseApi {
    private static instance;
    private readonly client;
    user: UserRepository;
    constructor(params?: DatabaseApiConstructor);
    static getInstance(params: DatabaseApiConstructor): DatabaseApi;
}
export { DatabaseApi };
