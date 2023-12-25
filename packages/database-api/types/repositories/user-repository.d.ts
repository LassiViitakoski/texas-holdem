import { PrismaClient } from '@prisma/client';
export declare class UserRepository {
    private client;
    constructor(client: PrismaClient);
    findUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        username: string;
        email: string;
    }[]>;
}
