import { PrismaClient } from '@prisma/client';

export class UserRepository {
    constructor(private client: PrismaClient) {}

    findUsers() {
        return this.client.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
            },
        });
    }
}
