class DatabaseController {
    private connectionId: number;

    constructor(id: number) {
        this.connectionId = id;
    }

    public expose() {
        console.log(`Connection id of databasecontroller is ${this.connectionId}`);
    }
}

export { DatabaseController };
