export class UserRepository {
    client;
    constructor(client) {
        this.client = client;
    }
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
