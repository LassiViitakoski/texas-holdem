import { DatabaseController } from "database-api";

export class Player {
    public id: number;

    constructor(id: number) {
        this.id = id;
    }

    init() {
        const contr = new DatabaseController(566);
    }
}
